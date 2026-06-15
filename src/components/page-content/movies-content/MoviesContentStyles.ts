import { css } from 'styled-components'
import {
  animationFadeIn,
  animationFadeOut
} from '../../../utils/constants/styles'

export const MoviesContentStyles = css`
  ${animationFadeIn}

  &.fade-out {
    ${animationFadeOut}
  }

  .movies-controls {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }

  .movies-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .movie-item {
    padding: 10px 8px;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 4px;

    &:last-child {
      border-bottom: none;
    }

    &.movie-item--favorite {
      background-color: rgba(1, 127, 175, 0.05);
    }
  }

  .movie-primary {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .movie-star {
    color: #017faf;
    font-size: 16px;
    flex-shrink: 0;
  }

  .movie-title {
    font-weight: bold;
    font-size: 14px;
  }

  .movie-year {
    color: #888888;
    font-size: 12px;
    margin-left: auto;
    flex-shrink: 0;
  }

  .movie-director {
    color: #888888;
    font-size: 12px;
    margin-top: 2px;
  }
`
