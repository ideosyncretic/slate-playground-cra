// import "@atlaskit/css-reset";
import React, { useCallback, useMemo, useState } from "react";
import { withHistory } from "slate-history";
import { createEditor, Editor, Transforms } from "slate";
import { Slate, Editable, withReact, useEditor } from "slate-react";
import { v4 as uuidv4 } from "uuid";
import isHotkey from "is-hotkey";

import { toggleMark } from "./helpers/marks";
import { EditableContainer, Page } from "./components/styled-components";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const ANNOTATION_ID_PREFIX = "ANNOTATION-";

const LeafAnnotations = () => {
  const [editorValue, setEditorValue] = useState(initialEditorValue);
  const [annotations, setAnnotations] = useState(initialAnnotations);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const BaseEditor = useMemo(() => withHistory(withReact(createEditor())), []);

  const CodexEditor = {
    ...BaseEditor,

    annotateSelection(editor) {
      const newAnnotation = {
        id: ANNOTATION_ID_PREFIX + uuidv4(),
        range: editor.selection,
      };

      // update separate annotation state
      setAnnotations({ ...annotations, newAnnotation });

      // add an annotation id property to selection's nodes
      Transforms.setNodes(
        editor,
        { [newAnnotation.id]: newAnnotation },
        {
          match: (node) => Text.isText(node),
          split: true,
        }
      );
    },
  };

  return (
    <Slate
      editor={CodexEditor}
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
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(useEditor, mark);
                }
              }
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

  // check if leaf has annotations
  let annotationCount = 0;
  Object.keys(leaf).length > 0 &&
    Object.keys(leaf).map((key) => {
      if (key.indexOf(ANNOTATION_ID_PREFIX) > -1) {
        console.log("Found an annotation, id=", key);
        annotationCount += 1;
      }
    });

  // if leaf has annotations
  if (annotationCount) {
    if (annotationCount === 1) {
      children = (
        <span
          style={{ backgroundColor: "salmon" }}
          onClick={() => console.log("I'm annotated once!")}
        >
          {children}
        </span>
      );
    }
    if (annotationCount === 2) {
      children = (
        <span
          style={{ backgroundColor: "red" }}
          onClick={() => console.log("I'm annotated multiple times!")}
        >
          {children}
        </span>
      );
    }
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
    id: "ANNOTATION-1", // "This is"
    // parentTextString: "This is",
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
    id: "ANNOTATION-2", // "is editable"
    // parentTextString: "is editable",
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
        "ANNOTATION-1": true,
      },
      {
        text: " ",
        "ANNOTATION-1": true,
      },
      {
        text: "is",
        "ANNOTATION-1": true,
        "ANNOTATION-2": true,
      },
      {
        text: " editable",
        "ANNOTATION-2": true,
      },
      {
        text: " rich text, ",
      },
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
