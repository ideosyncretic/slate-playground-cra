// import "@atlaskit/css-reset";
import React, { useCallback, useMemo, useState } from "react";
import { withHistory } from "slate-history";
// Import the Slate editor factory.
import { createEditor, Text } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";

import { EditableContainer, Page } from "./components/styled-components";

const HighlightDecorator = () => {
  const [editorValue, setEditorValue] = useState(initialEditorValue);
  // NOTE highlights stored separately from main content
  const [highlights, setHighlights] = useState(initialHighlights);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const highlightDecorator = useCallback(
    ([node, path]) => {
      // console.log("node", node);
      const ranges = [];
      // console.log("highlights", highlights);

      if (highlights && Text.isText(node)) {
        // for every highlight we have
        highlights.map((highlight) => {
          // console.log("current highlight", highlight);
          // push the range to be decorated
          ranges.push({
            anchor: { path, offset: highlight.anchorOffset },
            focus: { path, offset: highlight.focusOffset },
            highlighted: true,
          });
        });
      }
      return ranges;
    },
    [highlights]
  );

  return (
    <Slate
      editor={editor}
      value={editorValue}
      onChange={(newValue) => setEditorValue(newValue)}
    >
      <Page>
        <EditableContainer>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Enter some rich text…"
            spellCheck
            autoFocus
            decorate={highlightDecorator}
          />
        </EditableContainer>
      </Page>
    </Slate>
  );
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.highlighted) {
    children = (
      <span
        style={{
          backgroundColor: "#ffeeba",
        }}
      >
        {children}
      </span>
    );
  }

  // example of arbitrary property
  if (leaf.blue) {
    // find out if depth is 0, 1, 2
    let opacity;
    leaf.blue.length >= 2 ? (opacity = 1) : (opacity = 0.5);

    children = (
      <span
        style={{
          color: `rgba(0,0,255, ${opacity})`,
        }}
      >
        {children}
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};

const initialHighlights = [
  {
    id: "id_1_This", // "This"
    text: "This",
    anchorOffset: 0,
    focusOffset: 4,
  },
  {
    id: "id_2_editable",
    text: "editable",
    anchorOffset: 8,
    focusOffset: 16,
  },
];

const initialEditorValue = [
  {
    type: "paragraph",
    children: [
      {
        text: "This is editable ",
        blue: ["blue_1"],
      },
      {
        text: "rich",
        blue: ["blue_1", "blue_2", "blue_3"],
      },
      { text: " text, ", blue: ["blue_2"] },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<textarea>", code: true },
      { text: "!" },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: "bold and underline", bold: true, underline: true },
      {
        text:
          ", or add a semantically rendered block quote in the middle of the page, like this:",
      },
    ],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    children: [{ text: "Try it out for yourself!" }],
  },
];
export default HighlightDecorator;
