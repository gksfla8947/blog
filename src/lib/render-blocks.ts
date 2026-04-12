/**
 * Simple server-side BlockNote JSON → HTML fallback renderer.
 * The primary HTML generation happens client-side via BlockNote's editor.blocksToFullHTML().
 * This is used as a fallback for migration scripts or when client rendering isn't available.
 */

export function blocksToHtml(blocks: unknown[]): string {
  if (!Array.isArray(blocks)) return "";
  return wrapLists(blocks.map(renderBlock)).join("\n");
}

function renderBlock(block: any): { type: string; html: string } {
  const type = block?.type ?? "paragraph";
  const text = extractText(block);
  const children = block?.children?.length
    ? blocksToHtml(block.children)
    : "";

  switch (type) {
    case "heading": {
      const level = Math.min(block.props?.level ?? 1, 6);
      return { type, html: `<h${level}>${text}</h${level}>` };
    }
    case "paragraph":
      return { type, html: text ? `<p>${text}</p>` : "" };
    case "bulletListItem":
      return { type, html: `<li>${text}${children ? `\n<ul>${children}</ul>` : ""}</li>` };
    case "numberedListItem":
      return { type, html: `<li>${text}${children ? `\n<ol>${children}</ol>` : ""}</li>` };
    case "checkListItem":
      return { type, html: `<li><input type="checkbox" ${block.props?.checked ? "checked" : ""} disabled />${text}</li>` };
    case "image":
      return { type, html: `<figure><img src="${esc(block.props?.url ?? "")}" alt="${esc(block.props?.caption ?? "")}" />${block.props?.caption ? `<figcaption>${esc(block.props.caption)}</figcaption>` : ""}</figure>` };
    case "video":
      return { type, html: `<video src="${esc(block.props?.url ?? "")}" controls></video>` };
    case "codeBlock":
      return { type, html: `<pre><code class="language-${esc(block.props?.language ?? "")}">${esc(text)}</code></pre>` };
    case "quote":
      return { type, html: `<blockquote>${text}</blockquote>` };
    case "divider":
      return { type, html: `<hr />` };
    case "table":
      return { type, html: renderTable(block) };
    default:
      return { type, html: text ? `<p>${text}</p>` : "" };
  }
}

function wrapLists(items: { type: string; html: string }[]): string[] {
  const result: string[] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];
    if (item.type === "bulletListItem") {
      const group: string[] = [];
      while (i < items.length && items[i].type === "bulletListItem") {
        group.push(items[i].html);
        i++;
      }
      result.push(`<ul>${group.join("\n")}</ul>`);
    } else if (item.type === "numberedListItem") {
      const group: string[] = [];
      while (i < items.length && items[i].type === "numberedListItem") {
        group.push(items[i].html);
        i++;
      }
      result.push(`<ol>${group.join("\n")}</ol>`);
    } else {
      if (item.html) result.push(item.html);
      i++;
    }
  }

  return result;
}

function extractText(block: any): string {
  if (!block?.content) return "";
  if (typeof block.content === "string") return esc(block.content);
  if (Array.isArray(block.content)) {
    return block.content
      .map((c: any) => {
        if (typeof c === "string") return esc(c);
        let text = esc(c.text ?? "");
        if (c.styles?.bold) text = `<strong>${text}</strong>`;
        if (c.styles?.italic) text = `<em>${text}</em>`;
        if (c.styles?.code) text = `<code>${text}</code>`;
        if (c.styles?.strikethrough) text = `<s>${text}</s>`;
        if (c.styles?.underline) text = `<u>${text}</u>`;
        if (c.type === "link") text = `<a href="${esc(c.href ?? "")}">${text}</a>`;
        return text;
      })
      .join("");
  }
  return "";
}

function renderTable(block: any): string {
  const rows = block?.content?.rows;
  if (!Array.isArray(rows)) return "";
  const html = rows
    .map(
      (row: any, i: number) =>
        `<tr>${(row.cells ?? [])
          .map((cell: any) => {
            const tag = i === 0 ? "th" : "td";
            const text = Array.isArray(cell)
              ? cell.map((c: any) => esc(c.text ?? "")).join("")
              : "";
            return `<${tag}>${text}</${tag}>`;
          })
          .join("")}</tr>`
    )
    .join("\n");
  return `<table>\n${html}\n</table>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
