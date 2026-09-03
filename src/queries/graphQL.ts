import { gql } from '@apollo/client'

export const GET_PORTFOLIO_ITEMS = gql`
  query GetPortfolioItems {
    portfolioItems {
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
  mutation CreatePortfolioItem(
    $categories: [Int!]!,
    $description: String!,
    $links: [Int!]!,
    $homeImage: Int!,
    $projectImages: [Int!]!,
    $name: String!,
    $primaryImage: Int!,
    $products: [Int!]!,
    $projectId: String!) {
    createPortfolioItem(categories: $categories,
    description: $description,
    links: $links,
    homeImage: $homeImage,
    projectImages: $projectImages,
    name: $name,
    primaryImage: $primaryImage,
    products: $products,
    projectId: $projectId
  ) {
      success
      portfolioItem {
        categories {
          id
          name
        }
        description
        githubLinks {
          id
          isInternal
          label
          type {
            id
            name
          }
          url
        }
        links {
          id
          isInternal
          label
          url
        }
        homeImage {
          id
          imageUrl
        }
        id
        projectImages {
          id
          imageUrl
        }
        name
        primaryImage {
          id
          imageUrl
        }
        productLinks {
          id
          isInternal
          label
          url
        }
        products {
          id
          name
        }
        projectId
      }
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
