import { gql } from '@apollo/client'

export const GET_PORTFOLIO_ITEMS = gql`
  query GetPortfolioItems {
    portfolioItems {
      id
      githubLinks {
        url
        label
        isInternal
      }
      productLinks {
        url
        label
        isInternal
      }
      categories {
        name
      }
      products {
        name
      }
      primaryImage {
        imageUrl
      }
      name
      projectImages {
        imageUrl
      }
      projectId
      homeImage {
        imageUrl
      }
      description
    }
  }
`

export const CREATE_PORTFOLIO_ITEMS = gql`
  mutation CreatePortfolioItem($input: CreatePortfolioItemInput!) {
    createPortfolioItem(input: $input) {
      code
      message
      success
      portfolioItem {
        categories {
          name
        }
        description
        githubLinks {
          isInternal
          label
          url
        }
        homeImage {
          imageUrl
        }
        name
        primaryImage {
          imageUrl
        }
        productLinks {
          isInternal
          label
          url
        }
        products {
          name
        }
        projectId
        projectImages {
          imageUrl
        }
      }
    }
  }
`

export const UPDATE_PORTFOLIO_ITEM = gql`
  mutation UpdatePortfolioItem($id: Int!, $input: CreatePortfolioItemInput!) {
    updatePortfolioItem(id: $id, input: $input) {
      code
      message
      success
      portfolioItem {
        id
        projectId
      }
    }
  }
`

export const REORDER_PORTFOLIO_ITEMS = gql`
  mutation ReorderPortfolioItems($ids: [Int!]!) {
    reorderPortfolioItems(ids: $ids) {
      code
      message
      success
    }
  }
`

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      code
      message
      success
      token
    }
  }
`

export const GET_MARKET_SERIES = gql`
  query GetMarketSeries($ids: [String!], $from: String) {
    marketSeries(ids: $ids, from: $from) {
      fredId
      label
      category
      unit
      observations {
        date
        value
      }
      latest {
        date
        value
      }
      previous {
        date
        value
      }
    }
  }
`

export const GET_YIELD_CURVE = gql`
  query GetYieldCurve($date: String) {
    yieldCurve(date: $date) {
      date
      points {
        fredId
        label
        months
        value
      }
      comparisons {
        key
        label
        date
        points {
          fredId
          value
        }
      }
    }
  }
`
