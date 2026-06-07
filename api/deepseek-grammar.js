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
    requiredShape: {
      tokens: [{ word: "词", pos: "词类或功能" }],
      verb: "核心动词",
      valency: {
        type: "几价动词",
        frame: "施事 + 受事 + 处所",
        explanation: "读者友好的解释",
        slots: [{ label: "施事", english: "Agent", word: "例词", note: "说明" }],
      },
      caseGrammar: { pattern: "格框架", insight: "说明" },
      dependency: {
        root: "核心动词",
        insight: "说明",
        relations: [{ from: "从属词", to: "核心词", rel: "关系", color: "#0d6b63" }],
      },
      topicComment: { topic: "话题", comment: "述题", insight: "说明" },
      theta: { grid: "V <Agent, Patient>", principle: "说明" },
      pedagogy: ["教学建议1", "教学建议2", "教学建议3"],
      confidence: 0.9,
    },
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
            "You are a Chinese grammar analysis engine for international Chinese education. Return JSON only. Use exactly the requested object shape and field names. Use Chinese labels. Analyze with valency grammar as the main frame, and supplement with case grammar, dependency grammar, topic-comment grammar, theta roles, and brief teaching suggestions. Keep explanations reader-friendly and academic. Do not return markdown.",
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
