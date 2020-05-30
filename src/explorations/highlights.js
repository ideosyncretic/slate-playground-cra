// import "@atlaskit/css-reset";
import isHotkey from "is-hotkey";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { withHistory } from "slate-history";
// Import the Slate editor factory.
import { createEditor, Editor, Text, Transforms, Range } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact, useSlate } from "slate-react";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const Highlights = () => {
  const [editorValue, setEditorValue] = useState(initialEditorValue);
  const [highlights, setHighlights] = useState(initialHighlights);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const highlightDecorator = useCallback(
    // callback function
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
    // callback dependencies array
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
            onKeyDown={(event) => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }
            }}
          />
        </EditableContainer>
      </Page>
    </Slate>
  );
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
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
    children = <span style={{ backgroundColor: "#ffeeba" }}>{children}</span>;
  }

  // an "additive" blue colour style
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

const EditableContainer = styled.div`
  background: white;
  line-height: 1.5;
  font-size: 20px;
  margin: 30px;
  padding: 24px;
  border-radius: 5px;
  max-width: 900px;
  min-width: 300px;
  max-height: 100%;
`;

const Page = styled.div`
  background: #eeeeee;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

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
export default Highlights;
