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

export interface MarketObservation {
  __typename?: 'MarketObservation'
  date: Scalars['String']['output']
  value: Scalars['Float']['output']
}

export interface MarketSeries {
  __typename?: 'MarketSeries'
  category: Scalars['String']['output']
  fredId: Scalars['String']['output']
  label: Scalars['String']['output']
  lastFetchedAt?: Maybe<Scalars['String']['output']>
  /**
   * The most recent observation for the series overall. Unaffected by `from`/`to`,
   * so a windowed chart query still reports the current value.
   */
  latest?: Maybe<MarketObservation>
  /** Observations for the series, narrowed by the `from`/`to` query arguments. */
  observations: MarketObservation[]
  /** The observation before `latest`, for computing the change. Unaffected by `from`/`to`. */
  previous?: Maybe<MarketObservation>
  unit: Scalars['String']['output']
}

export interface Mutation {
  __typename?: 'Mutation'
  createPortfolioItem: CreatePortfolioItemResponse
  login: AuthResponse
  /** Sets the site order. `ids` must list every portfolio item exactly once, first to last. */
  reorderPortfolioItems: ReorderPortfolioItemsResponse
  /** Replaces the saved room plan. `data` must be a JSON object with `furniture` and `rooms` arrays. */
  saveRoomPlan: SaveRoomPlanResponse
  /** Replaces every field of the item with `id`. Takes the same input as `createPortfolioItem`. */
  updatePortfolioItem: UpdatePortfolioItemResponse
}

export interface MutationCreatePortfolioItemArgs {
  input: CreatePortfolioItemInput
}

export interface MutationLoginArgs {
  password: Scalars['String']['input']
  username: Scalars['String']['input']
}

export interface MutationReorderPortfolioItemsArgs {
  ids: Array<Scalars['Int']['input']>
}

export interface MutationSaveRoomPlanArgs {
  data: Scalars['String']['input']
}

export interface MutationUpdatePortfolioItemArgs {
  id: Scalars['Int']['input']
  input: CreatePortfolioItemInput
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
  /** In gallery order, as given in the input's `projectImages`. */
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
  marketSeries: MarketSeries[]
  portfolioItems: PortfolioItem[]
  products: Product[]
  projectImages: ProjectImage[]
  /** The saved room plan, or null before one is saved. Admin only. */
  roomPlan?: Maybe<RoomPlan>
  yieldCurve: YieldCurve
}

export interface QueryMarketSeriesArgs {
  category?: InputMaybe<Scalars['String']['input']>
  from?: InputMaybe<Scalars['String']['input']>
  ids?: InputMaybe<Array<Scalars['String']['input']>>
  to?: InputMaybe<Scalars['String']['input']>
}

export interface QueryYieldCurveArgs {
  date?: InputMaybe<Scalars['String']['input']>
}

export interface ReorderPortfolioItemsResponse {
  __typename?: 'ReorderPortfolioItemsResponse'
  code: Scalars['Int']['output']
  message: Scalars['String']['output']
  portfolioItems?: Maybe<PortfolioItem[]>
  success: Scalars['Boolean']['output']
}

/** A room planner plan. `data` is the plan as JSON text. */
export interface RoomPlan {
  __typename?: 'RoomPlan'
  data: Scalars['String']['output']
  updatedAt: Scalars['String']['output']
}

export interface SaveRoomPlanResponse {
  __typename?: 'SaveRoomPlanResponse'
  code: Scalars['Int']['output']
  message: Scalars['String']['output']
  roomPlan?: Maybe<RoomPlan>
  success: Scalars['Boolean']['output']
}

export interface UpdatePortfolioItemResponse {
  __typename?: 'UpdatePortfolioItemResponse'
  code: Scalars['Int']['output']
  message: Scalars['String']['output']
  portfolioItem?: Maybe<PortfolioItem>
  success: Scalars['Boolean']['output']
}

export interface YieldCurve {
  __typename?: 'YieldCurve'
  comparisons: YieldCurveComparison[]
  date: Scalars['String']['output']
  points: YieldCurvePoint[]
}

export interface YieldCurveComparison {
  __typename?: 'YieldCurveComparison'
  date: Scalars['String']['output']
  key: Scalars['String']['output']
  label: Scalars['String']['output']
  points: YieldCurvePoint[]
}

export interface YieldCurvePoint {
  __typename?: 'YieldCurvePoint'
  fredId: Scalars['String']['output']
  label: Scalars['String']['output']
  months: Scalars['Int']['output']
  value?: Maybe<Scalars['Float']['output']>
}
