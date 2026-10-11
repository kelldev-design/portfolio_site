export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends Record<string, unknown>> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends Record<string, unknown>, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string, output: string }
  String: { input: string, output: string }
  Boolean: { input: boolean, output: boolean }
  Int: { input: number, output: number }
  Float: { input: number, output: number }
}

export interface AuthResponse {
  __typename?: 'AuthResponse'
  code: Scalars['Int']['output']
  message: Scalars['String']['output']
  success: Scalars['Boolean']['output']
  token?: Maybe<Scalars['String']['output']>
}

export interface Category {
  __typename?: 'Category'
  id: Scalars['Int']['output']
  name: Scalars['String']['output']
}

export interface CreatePortfolioItemInput {
  categories: Array<Scalars['String']['input']>
  description: Scalars['String']['input']
  githubLinks: PortfolioLinkInput[]
  homeImage: Scalars['String']['input']
  name: Scalars['String']['input']
  primaryImage: Scalars['String']['input']
  productLinks: PortfolioLinkInput[]
  products: Array<Scalars['String']['input']>
  projectId: Scalars['String']['input']
  projectImages: Array<Scalars['String']['input']>
}

export interface CreatePortfolioItemResponse {
  __typename?: 'CreatePortfolioItemResponse'
  code: Scalars['Int']['output']
  message: Scalars['String']['output']
  portfolioItem?: Maybe<PortfolioItem>
  success: Scalars['Boolean']['output']
}

export interface Link {
  __typename?: 'Link'
  id: Scalars['Int']['output']
  isInternal: Scalars['Boolean']['output']
  label: Scalars['String']['output']
  type: LinkType
  url: Scalars['String']['output']
}

export interface LinkType {
  __typename?: 'LinkType'
  id: Scalars['Int']['output']
  name: Scalars['String']['output']
}

export interface Mutation {
  __typename?: 'Mutation'
  createPortfolioItem: CreatePortfolioItemResponse
  login: AuthResponse
}

export interface MutationCreatePortfolioItemArgs {
  input: CreatePortfolioItemInput
}

export interface MutationLoginArgs {
  password: Scalars['String']['input']
  username: Scalars['String']['input']
}

export interface PortfolioItem {
  __typename?: 'PortfolioItem'
  categories: Category[]
  description: Scalars['String']['output']
  githubLinks?: Maybe<Link[]>
  homeImage: ProjectImage
  id: Scalars['Int']['output']
  links: Link[]
  name: Scalars['String']['output']
  primaryImage: ProjectImage
  productLinks?: Maybe<Link[]>
  products: Product[]
  projectId: Scalars['String']['output']
  projectImages: ProjectImage[]
}

export interface PortfolioLinkInput {
  isInternal: Scalars['Boolean']['input']
  label: Scalars['String']['input']
  url: Scalars['String']['input']
}

export interface Product {
  __typename?: 'Product'
  id: Scalars['Int']['output']
  name: Scalars['String']['output']
}

export interface ProjectImage {
  __typename?: 'ProjectImage'
  id: Scalars['Int']['output']
  imageUrl: Scalars['String']['output']
}

export interface Query {
  __typename?: 'Query'
  categories: Category[]
  linkTypes: LinkType[]
  links: Link[]
  portfolioItems: PortfolioItem[]
  products: Product[]
  projectImages: ProjectImage[]
}
