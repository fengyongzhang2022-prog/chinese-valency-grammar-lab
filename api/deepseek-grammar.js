export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: "Missing server configuration" });
    return;
  }

  const sentence = request.body?.sentence || "";
  const prompt = {
    sentence,
    task:
      "Analyze this Chinese sentence for readers of an academic Chinese grammar page. Return JSON only.",
    requiredFields: [
      "tokens",
      "verb",
      "valency",
      "caseGrammar",
      "dependency",
      "topicComment",
      "theta",
      "pedagogy",
      "confidence",
    ],
  };

  const upstream = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a Chinese grammar analysis engine for international Chinese education. Return JSON only. Use Chinese labels. Analyze with valency grammar as the main frame, and supplement with case grammar, dependency grammar, topic-comment grammar, theta roles, and brief teaching suggestions. Keep explanations reader-friendly and academic.",
        },
        { role: "user", content: JSON.stringify(prompt) },
      ],
    }),
  });

  if (!upstream.ok) {
    response.status(upstream.status).json({ error: "Model request failed" });
    return;
  }

  const data = await upstream.json();
  const content = data?.choices?.[0]?.message?.content || "{}";

  try {
    response.status(200).json(JSON.parse(content));
  } catch {
    response.status(200).json({ raw: content });
  }
}
