export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, category, tags, content, password } = body;

    // Auth check
    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!title || !slug || !content) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const date = new Date().toISOString().slice(0, 10);
    const tagList = (tags as string)
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    const frontmatter = [
      "---",
      `title: "${title}"`,
      `date: "${date}"`,
      `description: "${description || ""}"`,
      `category: "${category || "일반"}"`,
      `tags: [${tagList.map((t: string) => `"${t}"`).join(", ")}]`,
      "---",
    ].join("\n");

    const fileContent = `${frontmatter}\n\n${content}`;
    const filePath = `content/posts/${slug}.mdx`;

    // Commit via GitHub API
    const res = await fetch(
      `https://api.github.com/repos/gksfla8947/blog/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add post: ${title}`,
          content: Buffer.from(fileContent).toString("base64"),
          branch: "master",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return Response.json(
        { error: err.message || "GitHub API error" },
        { status: res.status }
      );
    }

    return Response.json({ success: true, slug });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
