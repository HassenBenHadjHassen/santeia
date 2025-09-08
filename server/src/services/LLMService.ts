// LLM Service using OpenAI client (against HF router by default)
import OpenAI from "openai";
import { config } from "@/config/environment";
import { LLMRepository } from "@/repositories/LLMRepository";
import { ServiceResponse } from "@/types";

export interface LLMRequest {
	prompt: string;
	userId: string;
	conversationId?: string;
	maxTokens?: number;
	temperature?: number;
	topP?: number;
	repetitionPenalty?: number;
}

export interface LLMResponse {
	text: string;
	tokens: number;
	duration: number;
	cost?: number;
}

export class LLMService {
	private readonly openai: OpenAI;
	private model: string;
	private llmRepository: LLMRepository;

	constructor() {
		this.openai = new OpenAI({
			apiKey: config.HUGGINGFACE_API_KEY,
			baseURL: config.OPENAI_BASE_URL,
		});
		this.model = config.HUGGINGFACE_MODEL;
		this.llmRepository = new LLMRepository();
	}

	public async generateText(
		request: LLMRequest
	): Promise<ServiceResponse<LLMResponse>> {
		try {
			const startTime = Date.now();

			// Call OpenAI-compatible chat completions
			const completion = await this.openai.chat.completions.create({
				model: this.model,
				messages: [
					{
						role: "system",
						content:
							'You are SantéAI, a safe, empathetic, and helpful health assistant. Follow these rules when interacting with users: 1. Provide informative and educational guidance. 2. NEVER diagnose, prescribe, or replace professional medical advice. 3. Always include a disclaimer advising consulting a healthcare professional when needed. 4. Personalize responses based on relevant user conversation history. 5. Ask clarifying questions only when necessary to provide safe guidance for each symptom. Limit questions to essential information. 6. Be empathetic: acknowledge the user’s concerns and feelings. Provide clear, concise guidance (ideally 2–3 sentences) and never omit safety advice or disclaimers. 7. If the user reports severe or urgent symptoms (chest pain, fainting, shortness of breath, high fever, severe headache, vision loss, sudden weakness), immediately advise urgent medical attention. 8. Avoid using “—” in replies. 9. If unsure about any health situation, clearly state that you cannot provide a diagnosis and recommend consulting a professional. 10. At the start of a conversation, greet the user personally without assuming any symptoms. Do NOT infer or guess health issues. Always acknowledge the user’s feelings or concerns. Example greeting: "Hello [Name], I\'m SantéAI, here to help you safely with your health concerns. Please describe any symptoms you are experiencing so I can provide safe guidance. [Disclaimer: This conversation is for informational purposes only. Always consult a healthcare professional.]"',
					},
					{ role: "user", content: request.prompt },
				],
				temperature: request.temperature ?? 0.7,
				top_p: request.topP ?? 0.9,
				max_tokens: request.maxTokens ?? 512,
			});

			const duration = Date.now() - startTime;
			const generatedText = completion.choices?.[0]?.message?.content || "";

			// Calculate approximate token count (rough estimation)
			const tokens = Math.ceil(generatedText.length / 4);

			// Calculate cost (approximate for Llama 3.1 405B)
			const cost = this.calculateCost(tokens);

			const llmResponse: LLMResponse = {
				text: generatedText.trim(),
				tokens,
				duration,
				cost,
			};

			// Log the request to database
			await this.llmRepository.create({
				model: this.model,
				prompt: request.prompt,
				response: generatedText,
				tokens,
				cost,
				duration,
				userId: request.userId,
			});

			return {
				success: true,
				data: llmResponse,
			};
		} catch (error) {
			console.error("LLM generation error:", error);
			return {
				success: false,
				error: `Failed to generate text: ${error}`,
			};
		}
	}

	public async generateConversationResponse(
		messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
		userId: string,
		conversationId?: string
	): Promise<ServiceResponse<LLMResponse>> {
		try {
			const startTime = Date.now();

			// Ensure we have a system message
			const formattedMessages =
				messages.length > 0 && messages[0].role === "system"
					? messages
					: [
							{
								role: "system" as const,
								content:
									"You are a helpful AI assistant for SanteIA, a health-focused application. Provide accurate, helpful, and empathetic responses.",
							},
							...messages,
					  ];

			// Call OpenAI-compatible chat completions
			const completion = await this.openai.chat.completions.create({
				model: this.model,
				messages: formattedMessages.map((m) => ({
					role: m.role,
					content: m.content,
				})),
				temperature: 0.7,
				top_p: 0.9,
				max_tokens: 256,
			});

			const duration = Date.now() - startTime;
			const generatedText = completion.choices?.[0]?.message?.content || "";
			const tokens = Math.ceil(generatedText.length / 4);
			const cost = this.calculateCost(tokens);

			const llmResponse: LLMResponse = {
				text: generatedText.trim(),
				tokens,
				duration,
				cost,
			};

			// Log the request to database
			const promptText = formattedMessages
				.map((msg) => `${msg.role}: ${msg.content}`)
				.join("\n");
			await this.llmRepository.create({
				model: this.model,
				prompt: promptText,
				response: generatedText,
				tokens,
				cost,
				duration,
				userId,
			});

			return {
				success: true,
				data: llmResponse,
			};
		} catch (error) {
			console.error("LLM conversation error:", error);
			return {
				success: false,
				error: `Failed to generate conversation response: ${error}`,
			};
		}
	}

	public async getModelInfo(): Promise<ServiceResponse<any>> {
		try {
			// Return static model information since modelInfo is not available
			return {
				success: true,
				data: {
					id: this.model,
					name: this.model,
					description: "Meta Llama 3.1 405B Instruct model for text generation",
					provider: "Hugging Face",
					capabilities: ["text-generation", "conversational-ai"],
				},
			};
		} catch (error) {
			console.error("Model info error:", error);
			return {
				success: false,
				error: `Failed to get model information: ${error}`,
			};
		}
	}

	private calculateCost(tokens: number): number {
		// Approximate cost calculation for Llama 3.1 405B
		// This is a rough estimate - actual costs may vary
		const costPerToken = 0.0001; // $0.0001 per token (example rate)
		return tokens * costPerToken;
	}

	public async getUsageStats(userId: string): Promise<ServiceResponse<any>> {
		try {
			const stats = await this.llmRepository.getUsageStats(userId);

			return {
				success: true,
				data: stats,
			};
		} catch (error) {
			return {
				success: false,
				error: `Failed to get usage stats: ${error}`,
			};
		}
	}

	public async getRecentRequests(
		userId: string,
		limit: number = 10
	): Promise<ServiceResponse<any[]>> {
		try {
			const requests = await this.llmRepository.getRecentRequests(
				userId,
				limit
			);

			return {
				success: true,
				data: requests,
			};
		} catch (error) {
			return {
				success: false,
				error: `Failed to get recent requests: ${error}`,
			};
		}
	}
}
