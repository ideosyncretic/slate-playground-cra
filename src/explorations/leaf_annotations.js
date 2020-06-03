// import "@atlaskit/css-reset";
import React, { useCallback, useMemo, useState } from "react";
import { withHistory } from "slate-history";
import { createEditor, Editor, Transforms } from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { v4 as uuidv4 } from "uuid";
import isHotkey from "is-hotkey";
import styled from "styled-components";

import { Button, Icon } from "../components";

import {
  EditableContainer,
  Page,
  PageContent,
} from "./components/styled-components";

// import { Toolbar } from "../components";

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

  // const CodexEditor = {
  //   ...BaseEditor,

  //   annotateSelection(editor) {
  //     const newAnnotation = {
  //       id: ANNOTATION_ID_PREFIX + uuidv4(),
  //       range: editor.selection,
  //     };

  //     // update separate annotation state
  //     setAnnotations({ ...annotations, newAnnotation });

  //     // add an annotation id property to selection's nodes
  //     Transforms.setNodes(
  //       editor,
  //       { [newAnnotation.id]: newAnnotation },
  //       {
  //         match: (node) => Text.isText(node),
  //         split: true,
  //       }
  //     );
  //   },
  // };

  return (
    <Slate
      editor={BaseEditor}
      value={editorValue}
      onChange={(newValue) => setEditorValue(newValue)}
    >
      <Page>
        <PageContent>
          <Toolbar>
            <AddAnnotationButton icon="add_comment" />
            <ClearAnnotationsButton icon="clear" />
            <MarkButton format="bold" icon="format_bold" />
            <MarkButton format="italic" icon="format_italic" />
            <MarkButton format="underline" icon="format_underlined" />
            <MarkButton format="code" icon="code" />
            <BlockButton format="heading-one" icon="looks_one" />
            <BlockButton format="heading-two" icon="looks_two" />
            <BlockButton format="block-quote" icon="format_quote" />
            <BlockButton format="numbered-list" icon="format_list_numbered" />
            <BlockButton format="bulleted-list" icon="format_list_bulleted" />
          </Toolbar>
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
                    toggleMark(BaseEditor, mark);
                  }
                }
              }}
            />
          </EditableContainer>
        </PageContent>
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

  // if leaf has annotations
  if (leaf.annotations) {
    const numberOfAnnotations = leaf.annotations.length;
    if (numberOfAnnotations === 1) {
      children = (
        <span
          style={{ backgroundColor: "#f6e58d" }}
          onClick={() => console.log("I'm annotated once!")}
        >
          {children}
        </span>
      );
    }
    if (numberOfAnnotations > 1) {
      children = (
        <span
          style={{ backgroundColor: "#f9ca24" }}
          onClick={() => console.log("I'm annotated more than once!")}
        >
          {children}
        </span>
      );
    }
  }

  return <span {...attributes}>{children}</span>;
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

// BLOCKS
const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

// MARKS

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const addAnnotation = (editor) => {
  const currentMarks = Editor.marks(editor);
  let currentAnnotations = [];

  if (currentMarks && currentMarks["annotations"]) {
    currentAnnotations = currentMarks["annotations"];
  }

  let newAnnotationId = uuidv4();

  let updatedAnnotations = [...currentAnnotations, newAnnotationId];

  Editor.addMark(editor, "annotations", updatedAnnotations);
};

const clearAnnotations = (editor) => {
  Editor.removeMark(editor, "annotations");
};

const AddAnnotationButton = ({ annotations, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={true}
      onMouseDown={(event) => {
        event.preventDefault();
        addAnnotation(editor);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const ClearAnnotationsButton = ({ icon }) => {
  const editor = useSlate();
  const currentMarks = Editor.marks(editor);
  let hasAnnotations = currentMarks && currentMarks["annotations"];

  console.log("has annotations", hasAnnotations);
  return (
    <Button
      active={hasAnnotations}
      isDisabled={!hasAnnotations}
      onMouseDown={(event) => {
        event.preventDefault();
        clearAnnotations(editor);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
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

const firstAnnotationId = uuidv4();
const secondAnnotationId = uuidv4();

const initialEditorValue = [
  {
    type: "paragraph",
    children: [
      {
        text: "This",
        annotations: [firstAnnotationId],
      },
      {
        text: " ",
        annotations: [firstAnnotationId],
      },
      {
        text: "is",
        annotations: [firstAnnotationId, secondAnnotationId],
      },
      {
        text: " editable",
        annotations: [secondAnnotationId],
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
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    children: [{ text: "Try it out for yourself!" }],
  },
];
export default LeafAnnotations;

const Toolbar = styled.div`
  width: 100%;
  ${"" /* padding: 16px; */}
  background: white;
  border-bottom: 3px solid #eeeeee;
  span {
    margin: 16px 0px 16px 8px;
  }
`;
