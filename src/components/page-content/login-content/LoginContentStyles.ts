import { css } from 'styled-components'
import {
  GREY1,
  GREY3,
  LINK1,
  STATUS_BAD
} from '../../../utils/constants/colors'
import { SPACING_X } from '../../../utils/constants/spacings'
import {
  animationFadeIn,
  animationFadeOut
} from '../../../utils/constants/styles'

export const LoginContentStyles = css`
  ${animationFadeIn}

  &.fade-out {
    ${animationFadeOut}
  }

  .flex-grow {
    flex-grow: 1;
  }

  .login-form {
    margin: 0px auto;
    max-width: 320px;
  }

  .login-error {
    color: ${STATUS_BAD};
    font-size: 13px;
  }

  .login-submit {
    background-color: ${LINK1};
    border: none;
    border-radius: 4px;
    color: ${GREY1};
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    padding: ${SPACING_X} ${SPACING_X};

    &:disabled {
      background-color: ${GREY3};
      cursor: default;
    }
  }
`
