// Import the GoogleGenerativeAI class from the generative-ai package
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  // Extract the content from the request body
  const { content } = await req.json();

  // If no content is provided, return a 400 Bad Request response
  if (!content) {
    return new Response(JSON.stringify({ error: "No content provided" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    // Initialize the Gemini model with specific parameters
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Define the prompt for the Gemini model
    const prompt = `

    You are a writing assistant. Your task is to enhance the given content by making it more engaging and interesting and correcting any grammatical errors.
    just focus on the content and do not add any additional information or context. just only enhance the content.and give the output in the same format as the input.
   
    here is the content:
${content}`;

    // Generate content using the Gemini model with the defined prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedText = response.text(); // Extract the generated text from the response

    // Return the enhanced text as a JSON response
    return new Response(JSON.stringify({ enhancedText }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error); // Log any errors to the console
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
