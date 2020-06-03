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
  HOTKEYS,
  BlockButton,
  MarkButton,
  toggleMark,
} from "../examples/richtext";

import {
  EditableContainer,
  Page,
  PageContent,
} from "./components/styled-components";

const AnnotationsExample = () => {
  const [editorValue, setEditorValue] = useState(initialEditorValue);
  // const [annotations, setAnnotations] = useState(initialAnnotations);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const BaseEditor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Page>
      <PageContent>
        <Slate
          editor={BaseEditor}
          value={editorValue}
          onChange={(newValue) => setEditorValue(newValue)}
        >
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
        </Slate>
      </PageContent>
    </Page>
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
      children = <span style={{ backgroundColor: "#f6e58d" }}>{children}</span>;
    }
    if (numberOfAnnotations > 1) {
      children = <span style={{ backgroundColor: "#f9ca24" }}>{children}</span>;
    }
  }

  return <span {...attributes}>{children}</span>;
};

const addAnnotation = (editor) => {
  const currentMarks = Editor.marks(editor);
  let currentAnnotations = [];

  if (
    currentMarks &&
    currentMarks["annotations"] &&
    currentMarks["annotations"].length > 0
  ) {
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
  let hasAnnotations = false;
  if (
    currentMarks &&
    currentMarks["annotations"] &&
    currentMarks["annotations"].length > 0
  ) {
    hasAnnotations = true;
    console.log("Annotations: ", currentMarks["annotations"]);
  }

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

const firstAnnotationId = "d4c3d492-fdec-4eb0-9626-7852403de9c1";
const secondAnnotationId = "220cd04d-65c9-405e-aaaa-837f1543dc35";

const initialAnnotations = [
  {
    id: firstAnnotationId, // "This is"
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
    id: secondAnnotationId, // "is editable"
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
export default AnnotationsExample;

const Toolbar = styled.div`
  width: 100%;
  background: white;
  border-bottom: 3px solid #eeeeee;
  span {
    margin: 16px 0px 16px 8px;
  }
`;
