import matter from 'gray-matter';
import * as toml from 'toml';

export interface FrontMatter {
  title: string;
  menu?: string;
  [key: string]: any;
}

export interface ParsedMarkdown {
  frontmatter: FrontMatter;
  content: string;
  html: string;
}

export async function parseMarkdown(filePath: string): Promise<ParsedMarkdown> {
  try {
    const file = Bun.file(filePath);
    const fileContent = await file.text();

    const isIndexFile = filePath.endsWith('_index.md');

    let frontmatter: FrontMatter;
    let content: string;

    if (isIndexFile) {
      frontmatter = { title: "Simon's Crypta" };
      content = fileContent;
    } else {
      const parsed = matter(fileContent, {
        engines: {
          toml: toml.parse.bind(toml)
        },
        delimiters: '+++',
        language: 'toml'
      });

      frontmatter = parsed.data as FrontMatter;
      content = parsed.content;
    }

    // Use Bun's native markdown parser (CommonMark + GFM)
    const html = Bun.markdown.html(content, {
      gfm: true,           // GitHub Flavored Markdown
      breaks: false,       // Don't convert \n to <br>
    });

    return {
      frontmatter,
      content,
      html
    };
  } catch (error) {
    throw new Error(`Failed to parse markdown file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
