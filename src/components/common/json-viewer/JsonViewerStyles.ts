import { css } from 'styled-components'
import {
  GREY1,
  GREY2,
  GREY3,
  LINK1,
  SERIES2,
  SERIES3,
  SERIES5
} from '../../../utils/constants/colors'

export const JsonViewerStyles = css`
  background-color: ${GREY1};
  border-radius: 4px;
  color: ${GREY2};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.5;
  overflow: auto;
  padding: 8px;

  .json-viewer-line {
    white-space: nowrap;
  }

  summary.json-viewer-line {
    cursor: pointer;
  }

  /* The count stands in for the contents while closed, so it hides once they show. */
  .json-viewer-node[open] > summary .json-viewer-count {
    display: none;
  }

  .json-viewer-node:not([open]) > .json-viewer-close {
    display: none;
  }

  .json-viewer-children {
    border-left: 1px solid ${GREY3};
    margin-left: 4px;
    padding-left: 12px;
  }

  .json-viewer-close {
    padding-left: 12px;
  }

  .json-viewer-count {
    color: ${GREY3};
  }

  .json-viewer-key {
    color: ${LINK1};
  }

  .json-viewer-index {
    color: ${GREY3};
  }

  .json-viewer-string {
    color: ${SERIES3};
  }

  .json-viewer-number {
    color: ${SERIES2};
  }

  .json-viewer-boolean,
  .json-viewer-null {
    color: ${SERIES5};
  }
`
