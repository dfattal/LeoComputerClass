import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="mb-6 mt-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mb-4 mt-8 text-2xl font-semibold text-zinc-800 dark:text-zinc-200"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mb-3 mt-6 text-xl font-semibold text-zinc-800 dark:text-zinc-200"
      {...props}
    />
  ),
  p: (props) => (
    <p
      className="mb-4 leading-7 text-zinc-700 dark:text-zinc-300"
      {...props}
    />
  ),
  ul: (props) => <ul className="mb-4 ml-6 list-disc space-y-1" {...props} />,
  ol: (props) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1" {...props} />
  ),
  li: (props) => (
    <li className="text-zinc-700 dark:text-zinc-300" {...props} />
  ),
  code: (props) => {
    const isInline = typeof props.children === "string";
    if (isInline) {
      return (
        <code
          className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: (props) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100"
      {...props}
    />
  ),
  table: (props) => (
    <div className="mb-6 overflow-x-auto">
      <table
        className="mdx-table"
        {...props}
      />
    </div>
  ),
  thead: (props) => (
    <thead className="mdx-thead" {...props} />
  ),
  tbody: (props) => (
    <tbody {...props} />
  ),
  tr: (props) => (
    <tr className="mdx-tr" {...props} />
  ),
  th: (props) => (
    <th
      className="mdx-th"
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="mdx-td"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-zinc-200 dark:border-zinc-800" />,
  blockquote: (props) => (
    <blockquote
      className="mb-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
      {...props}
    />
  ),
  strong: (props) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-100" {...props} />
  ),
};
