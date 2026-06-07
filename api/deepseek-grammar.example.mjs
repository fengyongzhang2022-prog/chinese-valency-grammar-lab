/**
 * DeepSeek grammar proxy example.
 *
 * Use this pattern on the server side only. Put the key in an environment
 * variable named DEEPSEEK_API_KEY. Never place the key in a browser TSX file.
 *
 * Expected frontend route: POST /api/deepseek-grammar
 */

export async function deepseekGrammarHandler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Missing DEEPSEEK_API_KEY" }));
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const sentence = body?.sentence ?? "";

  const response = await fetch("https://api.deepseek.com/chat/completions", {
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
            "You are a Chinese grammar analysis engine for international Chinese education. Return JSON only. Analyze the sentence with valency grammar, case grammar, dependency grammar, topic-comment grammar, and theta-role theory. Match the frontend fields: tokens, verb, valency, caseGrammar, dependency, topicComment, theta, pedagogy, confidence.",
        },
        {
          role: "user",
          content: JSON.stringify({
            sentence,
            outputLanguage: "zh-CN",
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    res.statusCode = response.status;
    res.end(JSON.stringify({ error: await response.text() }));
    return;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(content);
}
