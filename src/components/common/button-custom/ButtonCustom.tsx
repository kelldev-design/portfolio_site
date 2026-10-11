import { type FunctionComponent, type ReactEventHandler, type ReactNode } from 'react'
import styled from 'styled-components'
import { ButtonCustomStyles } from './ButtonCustomStyles'

const ButtonCustomStyled = styled.button`${ButtonCustomStyles}`

interface ButtonCustomPropsType {
  onClick: ReactEventHandler
  title: string
  type?: 'button' | 'submit'
  children: ReactNode
}

export const ButtonCustom: FunctionComponent<ButtonCustomPropsType> = ({
  children,
  onClick,
  title,
  type = 'button'
}) =>
  <ButtonCustomStyled
    onClick={onClick}
    title={title}
    type={type}
  >
    { children }
  </ButtonCustomStyled>
