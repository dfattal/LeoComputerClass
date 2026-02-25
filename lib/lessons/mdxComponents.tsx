import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="mb-6 mt-8 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mb-4 mt-10 border-l-4 border-indigo-500 pl-3 text-xl font-semibold text-stone-800 dark:text-stone-200"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mb-3 mt-6 text-lg font-semibold text-indigo-700 dark:text-indigo-300"
      {...props}
    />
  ),
  p: (props) => (
    <p
      className="mb-4 text-base leading-7 text-stone-700 dark:text-stone-300"
      {...props}
    />
  ),
  ul: (props) => <ul className="mb-4 ml-6 list-disc space-y-1.5" {...props} />,
  ol: (props) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1.5" {...props} />
  ),
  li: (props) => (
    <li className="text-stone-700 leading-7 dark:text-stone-300" {...props} />
  ),
  code: (props) => {
    const isInline = typeof props.children === "string";
    if (isInline) {
      return (
        <code
          className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: (props) => (
    <pre
      className="mb-5 overflow-x-auto rounded-lg border border-stone-200 p-4 font-mono text-sm leading-relaxed text-stone-800 dark:border-stone-700 dark:text-stone-200"
      {...props}
    />
  ),
  table: (props) => (
    <div className="mb-6 overflow-x-auto rounded-lg border border-stone-200 shadow-sm dark:border-stone-800">
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
  hr: () => (
    <hr className="my-8 border-stone-200 dark:border-stone-800" />
  ),
  blockquote: (props) => (
    <blockquote
      className="mb-5 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 py-3 pl-4 pr-4 text-stone-700 dark:border-amber-500 dark:bg-amber-950/40 dark:text-stone-300"
      {...props}
    />
  ),
  strong: (props) => (
    <strong className="font-semibold text-stone-900 dark:text-stone-100" {...props} />
  ),
};
