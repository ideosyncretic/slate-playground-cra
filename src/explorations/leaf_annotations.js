// import "@atlaskit/css-reset";
import React, { useCallback, useMemo, useState } from "react";
import { withHistory } from "slate-history";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";

import { EditableContainer, Page } from "./components/styled-components";
import { handleKeyDownEvent } from "./helpers/marks";

const LeafAnnotations = () => {
  const [editorValue, setEditorValue] = useState(initialEditorValue);
  const [annotations, setAnnotations] = useState(initialAnnotations);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const baseEditor = useMemo(() => withHistory(withReact(createEditor())), []);

  const withAnnotations = (editorInstance) => {
    // example
    const { addMark } = editorInstance;
    editorInstance.addMark = (editor, key, val) => {
      console.log("Key = ", key);
      console.log("Value = ", val);
      // remember to fallback on default behaviour
      addMark(editor, key, val);
    };

    return editorInstance; // extended editor
  };

  const editor = withAnnotations(baseEditor);

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
            onKeyDown={(event) => {
              handleKeyDownEvent(event, editor);
            }}
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

  if (leaf.annotations) {
    if (leaf.annotations.length === 1) {
      children = (
        <span
          style={{ backgroundColor: "salmon" }}
          onClick={() => console.log(leaf.annotations)}
        >
          {children}
        </span>
      );
    }
    if (leaf.annotations.length === 2) {
      children = (
        <span
          style={{ backgroundColor: "red" }}
          onClick={() => console.log(leaf.annotations)}
        >
          {children}
        </span>
      );
    }
  }

  // example of arbitrary mark value
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

const stream = `This is editable rich text, much better than a <textarea>!
Since it's rich text, you can do things like turn a selection of text bold and underline, or add a semantically rendered block quote in the middle of the page, like this:
A wise quote.
Try it out for yourself!
`;

const initialAnnotations = [
  {
    id: "annotation_id_1", // "This is"
    text: "This is",
    range: {
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 7,
      },
    },
  },
  {
    id: "annotation_id_2",
    text: "is editable",
    range: {
      anchor: {
        path: [0, 0],
        offset: 5,
      },
      focus: {
        path: [0, 0],
        offset: 16,
      },
    },
  },
];

const initialEditorValue = [
  {
    type: "paragraph",
    children: [
      {
        text: "This",
        blue: ["blue_1"],
        annotations: ["annotation_id_1"],
      },
      {
        text: " ",
        blue: ["blue_1"],
        annotations: ["annotation_id_1"],
      },
      {
        text: "is",
        blue: ["blue_1"],
        annotations: ["annotation_id_1", "annotation_id_2"],
      },
      {
        text: " editable",
        blue: ["blue_1"],
        annotations: ["annotation_id_2"],
      },
      {
        text: " rich",
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
];
export default LeafAnnotations;
