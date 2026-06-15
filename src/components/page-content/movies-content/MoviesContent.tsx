import {
  type FunctionComponent,
  type ReactElement,
  useContext,
  useState,
  useMemo
} from 'react'
import styled from 'styled-components'
import { MoviesContentStyles } from './MoviesContentStyles'
import { SelectCustom } from '../../common/select-custom/SelectCustom'
import { TagH } from '../../common/tag-h/TagH'
import { TagP } from '../../common/tag-p/TagP'
import { Container } from '../../layout/container/Container'
import { FlexWrapper } from '../../layout/flex-wrapper/FlexWrapper'
import { PageRow } from '../../layout/page-row/PageRow'
import { Spacer } from '../../layout/spacer/Spacer'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'

const MoviesContentStyled = styled.div`${MoviesContentStyles}`

type SortKey = 'title' | 'year' | 'director'

const MOVIES = [
  { title: '10 Cloverfield Lane', year: 2016, director: 'Dan Trachtenberg', favorite: false },
  { title: '12 Years a Slave', year: 2013, director: 'Steve McQueen', favorite: false },
  { title: '1917', year: 2019, director: 'Sam Mendes', favorite: false },
  { title: '28 Days Later', year: 2002, director: 'Danny Boyle', favorite: true },
  { title: '300', year: 2006, director: 'Zack Snyder', favorite: false },
  { title: '99 Homes', year: 2014, director: 'Ramin Bahrani', favorite: false },
  { title: 'Alien', year: 1979, director: 'Ridley Scott', favorite: true },
  { title: 'Aliens', year: 1986, director: 'James Cameron', favorite: false },
  { title: 'Annihilation', year: 2018, director: 'Alex Garland', favorite: true },
  { title: 'Anora', year: 2024, director: 'Sean Baker', favorite: true },
  { title: 'Apocalypto', year: 2006, director: 'Mel Gibson', favorite: true },
  { title: 'Arbitrage', year: 2012, director: 'Nicholas Jarecki', favorite: false },
  { title: 'Baby Driver', year: 2017, director: 'Edgar Wright', favorite: false },
  { title: 'Backrooms', year: 2022, director: 'Kane Parsons', favorite: true },
  { title: 'Bad Santa', year: 2003, director: 'Terry Zwigoff', favorite: false },
  { title: 'Before the Devil Knows You\'re Dead', year: 2007, director: 'Sidney Lumet', favorite: false },
  { title: 'Blade Runner', year: 1982, director: 'Ridley Scott', favorite: true },
  { title: 'Blade Runner 2049', year: 2017, director: 'Denis Villeneuve', favorite: true },
  { title: 'Blue Ruin', year: 2013, director: 'Jeremy Saulnier', favorite: false },
  { title: 'Bodies Bodies Bodies', year: 2022, director: 'Halina Reijn', favorite: false },
  { title: 'Bombshell', year: 2019, director: 'Jay Roach', favorite: true },
  { title: 'Cabin in the Woods', year: 2012, director: 'Drew Goddard', favorite: true },
  { title: 'Children of Men', year: 2006, director: 'Alfonso Cuaron', favorite: false },
  { title: 'Cloverfield', year: 2008, director: 'Matt Reeves', favorite: false },
  { title: 'Cold in July', year: 2014, director: 'Jim Mickle', favorite: false },
  { title: 'Colossal', year: 2016, director: 'Nacho Vigalondo', favorite: false },
  { title: 'Creative Control', year: 2015, director: 'Benjamin Dickinson', favorite: false },
  { title: 'Deadpool', year: 2016, director: 'Tim Miller', favorite: false },
  { title: 'Deadpool 2', year: 2018, director: 'David Leitch', favorite: true },
  { title: 'Death at a Funeral', year: 2007, director: 'Frank Oz', favorite: false },
  { title: 'Dirty Pretty Things', year: 2002, director: 'Stephen Frears', favorite: false },
  { title: 'District 9', year: 2009, director: 'Neill Blomkamp', favorite: false },
  { title: 'Django Unchained', year: 2012, director: 'Quentin Tarantino', favorite: false },
  { title: 'Donnie Darko', year: 2001, director: 'Richard Kelly', favorite: true },
  { title: 'Dredd', year: 2012, director: 'Pete Travis', favorite: true },
  { title: 'Drive', year: 2011, director: 'Nicolas Winding Refn', favorite: false },
  { title: 'Enemy', year: 2013, director: 'Denis Villeneuve', favorite: false },
  { title: 'Eternal Sunshine of the Spotless Mind', year: 2004, director: 'Michel Gondry', favorite: false },
  { title: 'Ex Machina', year: 2014, director: 'Alex Garland', favorite: true },
  { title: 'Exit Through the Gift Shop', year: 2010, director: 'Banksy', favorite: true },
  { title: 'Experimenter', year: 2015, director: 'Michael Almereyda', favorite: false },
  { title: 'Fargo', year: 1996, director: 'Joel & Ethan Coen', favorite: true },
  { title: 'Faults', year: 2014, director: 'Riley Stearns', favorite: false },
  { title: 'Fight Club', year: 1999, director: 'David Fincher', favorite: true },
  { title: 'First Reformed', year: 2017, director: 'Paul Schrader', favorite: false },
  { title: 'Frankenstein', year: 2025, director: 'Guillermo del Toro', favorite: true },
  { title: 'Funny Games', year: 1997, director: 'Michael Haneke', favorite: false },
  { title: 'Gangs of New York', year: 2002, director: 'Martin Scorsese', favorite: false },
  { title: 'Get Out', year: 2017, director: 'Jordan Peele', favorite: true },
  { title: 'Gone Girl', year: 2014, director: 'David Fincher', favorite: false },
  { title: 'Hard Candy', year: 2005, director: 'David Slade', favorite: true },
  { title: 'Hereditary', year: 2018, director: 'Ari Aster', favorite: true },
  { title: 'I Don\'t Feel at Home in This World Anymore', year: 2017, director: 'Macon Blair', favorite: false },
  { title: 'In Bruges', year: 2008, director: 'Martin McDonagh', favorite: false },
  { title: 'Inception', year: 2010, director: 'Christopher Nolan', favorite: false },
  { title: 'Indie Game: The Movie', year: 2012, director: 'Lisanne Pajot & James Swirsky', favorite: false },
  { title: 'Inglourious Basterds', year: 2009, director: 'Quentin Tarantino', favorite: true },
  { title: 'Interstellar', year: 2014, director: 'Christopher Nolan', favorite: true },
  { title: 'It Follows', year: 2014, director: 'David Robert Mitchell', favorite: true },
  { title: 'John Dies at the End', year: 2012, director: 'Don Coscarelli', favorite: false },
  { title: 'John Wick', year: 2014, director: 'Chad Stahelski', favorite: true },
  { title: 'John Wick: Chapter 2', year: 2017, director: 'Chad Stahelski', favorite: true },
  { title: 'John Wick: Chapter 3 - Parabellum', year: 2019, director: 'Chad Stahelski', favorite: false },
  { title: 'John Wick: Chapter 4', year: 2023, director: 'Chad Stahelski', favorite: true },
  { title: 'Kick-Ass', year: 2010, director: 'Matthew Vaughn', favorite: false },
  { title: 'Kill Bill: Vol. 1', year: 2003, director: 'Quentin Tarantino', favorite: true },
  { title: 'Kill Bill: Vol. 2', year: 2004, director: 'Quentin Tarantino', favorite: true },
  { title: 'Killing Them Softly', year: 2012, director: 'Andrew Dominik', favorite: false },
  { title: 'Kingsman: The Secret Service', year: 2014, director: 'Matthew Vaughn', favorite: true },
  { title: 'Kiss Kiss Bang Bang', year: 2005, director: 'Shane Black', favorite: false },
  { title: 'Knives Out', year: 2019, director: 'Rian Johnson', favorite: false },
  { title: 'Glass Onion: A Knives Out Mystery', year: 2022, director: 'Rian Johnson', favorite: false },
  { title: 'Wake Up Dead Man: A Knives Out Mystery', year: 2025, director: 'Rian Johnson', favorite: true },
  { title: 'Locke', year: 2013, director: 'Steven Knight', favorite: false },
  { title: 'The Lobster', year: 2015, director: 'Yorgos Lanthimos', favorite: false },
  { title: 'Looper', year: 2012, director: 'Rian Johnson', favorite: false },
  { title: 'Louder Than Bombs', year: 2015, director: 'Joachim Trier', favorite: false },
  { title: 'Lucky Number Slevin', year: 2006, director: 'Paul McGuigan', favorite: false },
  { title: 'Mad Max: Fury Road', year: 2015, director: 'George Miller', favorite: false },
  { title: 'Margin Call', year: 2011, director: 'J.C. Chandor', favorite: true },
  { title: 'Memento', year: 2000, director: 'Christopher Nolan', favorite: false },
  { title: 'Miss Sloane', year: 2016, director: 'John Madden', favorite: true },
  { title: 'Moon', year: 2009, director: 'Duncan Jones', favorite: false },
  { title: 'Moonlight', year: 2016, director: 'Barry Jenkins', favorite: false },
  { title: 'Mother!', year: 2017, director: 'Darren Aronofsky', favorite: true },
  { title: 'Mystery Road', year: 2013, director: 'Ivan Sen', favorite: false },
  { title: 'Nancy', year: 2018, director: 'Christina Choe', favorite: false },
  { title: 'Neon Demon', year: 2016, director: 'Nicolas Winding Refn', favorite: false },
  { title: 'Nightcrawler', year: 2014, director: 'Dan Gilroy', favorite: false },
  { title: 'No Country for Old Men', year: 2007, director: 'Joel & Ethan Coen', favorite: true },
  { title: 'Nocturnal Animals', year: 2016, director: 'Tom Ford', favorite: true },
  { title: 'Pan\'s Labyrinth', year: 2006, director: 'Guillermo del Toro', favorite: true },
  { title: 'Parasite', year: 2019, director: 'Bong Joon-ho', favorite: false },
  { title: 'Pearl', year: 2022, director: 'Ti West', favorite: true },
  { title: 'Pi', year: 1998, director: 'Darren Aronofsky', favorite: false },
  { title: 'Poor Things', year: 2023, director: 'Yorgos Lanthimos', favorite: true },
  { title: 'Primer', year: 2004, director: 'Shane Carruth', favorite: false },
  { title: 'Prisoners', year: 2013, director: 'Denis Villeneuve', favorite: false },
  { title: 'Ready or Not', year: 2019, director: 'Matt Bettinelli-Olpin & Tyler Gillett', favorite: false },
  { title: 'Red Obsession', year: 2013, director: 'David Roach & Warwick Ross', favorite: false },
  { title: 'Reservoir Dogs', year: 1992, director: 'Quentin Tarantino', favorite: false },
  { title: 'Revenge', year: 2017, director: 'Coralie Fargeat', favorite: false },
  { title: 'Rogue One: A Star Wars Story', year: 2016, director: 'Gareth Edwards', favorite: false },
  { title: 'Room 237', year: 2012, director: 'Rodney Ascher', favorite: false },
  { title: 'Scott Pilgrim vs. the World', year: 2010, director: 'Edgar Wright', favorite: true },
  { title: 'Seven', year: 1995, director: 'David Fincher', favorite: false },
  { title: 'Sicario', year: 2015, director: 'Denis Villeneuve', favorite: true },
  { title: 'Silent Hill', year: 2006, director: 'Christophe Gans', favorite: false },
  { title: 'Sin City', year: 2005, director: 'Frank Miller & Robert Rodriguez', favorite: true },
  { title: 'Source Code', year: 2011, director: 'Duncan Jones', favorite: false },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, director: 'Persichetti, Ramsey & Rothman', favorite: false },
  { title: 'Spirited Away', year: 2001, director: 'Hayao Miyazaki', favorite: false },
  { title: 'Spotlight', year: 2015, director: 'Tom McCarthy', favorite: true },
  { title: 'Super 8', year: 2011, director: 'J.J. Abrams', favorite: false },
  { title: 'The Adjustment Bureau', year: 2011, director: 'George Nolfi', favorite: false },
  { title: 'The Animatrix', year: 2003, director: 'Various', favorite: false },
  { title: 'The Big Short', year: 2015, director: 'Adam McKay', favorite: true },
  { title: 'The Childhood of a Leader', year: 2015, director: 'Brady Corbet', favorite: false },
  { title: 'The Devil\'s Advocate', year: 1997, director: 'Taylor Hackford', favorite: false },
  { title: 'The East', year: 2013, director: 'Zal Batmanglij', favorite: false },
  { title: 'The Fifth Element', year: 1997, director: 'Luc Besson', favorite: false },
  { title: 'The Game', year: 1997, director: 'David Fincher', favorite: true },
  { title: 'The Gift', year: 2015, director: 'Joel Edgerton', favorite: true },
  { title: 'The Imitation Game', year: 2014, director: 'Morten Tyldum', favorite: false },
  { title: 'The Internet\'s Own Boy', year: 2014, director: 'Brian Knappenberger', favorite: false },
  { title: 'The Invitation', year: 2015, director: 'Karyn Kusama', favorite: false },
  { title: 'The Killing of a Sacred Deer', year: 2017, director: 'Yorgos Lanthimos', favorite: false },
  { title: 'The Life of David Gale', year: 2003, director: 'Alan Parker', favorite: false },
  { title: 'The Matrix', year: 1999, director: 'The Wachowskis', favorite: true },
  { title: 'The Place Beyond the Pines', year: 2012, director: 'Derek Cianfrance', favorite: false },
  { title: 'The Ring', year: 2002, director: 'Gore Verbinski', favorite: true },
  { title: 'The Shape of Water', year: 2017, director: 'Guillermo del Toro', favorite: true },
  { title: 'The Shining', year: 1980, director: 'Stanley Kubrick', favorite: true },
  { title: 'The Substance', year: 2024, director: 'Coralie Fargeat', favorite: true },
  { title: 'Watchmen', year: 2009, director: 'Zack Snyder', favorite: false },
  { title: 'The Whale', year: 2022, director: 'Darren Aronofsky', favorite: true },
  { title: 'The Wrestler', year: 2008, director: 'Darren Aronofsky', favorite: false },
  { title: 'There Will Be Blood', year: 2007, director: 'Paul Thomas Anderson', favorite: false },
  { title: 'These Final Hours', year: 2013, director: 'Zak Hilditch', favorite: false },
  { title: 'Timecrimes', year: 2007, director: 'Nacho Vigalondo', favorite: false },
  { title: 'Unbreakable', year: 2000, director: 'M. Night Shyamalan', favorite: false },
  { title: 'Under the Skin', year: 2013, director: 'Jonathan Glazer', favorite: false },
  { title: 'Us', year: 2019, director: 'Jordan Peele', favorite: true },
  { title: 'V for Vendetta', year: 2005, director: 'James McTeigue', favorite: false },
  { title: 'Waiting...', year: 2005, director: 'Rob McKittrick', favorite: false },
  { title: 'Wall-E', year: 2008, director: 'Andrew Stanton', favorite: false },
  { title: 'Weapons', year: 2024, director: 'Zach Cregger', favorite: false },
  { title: 'We Need to Talk About Kevin', year: 2011, director: 'Lynne Ramsay', favorite: false },
  { title: 'We Steal Secrets', year: 2013, director: 'Alex Gibney', favorite: false },
  { title: 'X', year: 2022, director: 'Ti West', favorite: false }
]

const DIRECTORS = Array.from(new Set(MOVIES.map(m => m.director))).sort()

const MoviesContent: FunctionComponent = () => {
  const { isNavigating } = useContext(PortfolioContext)
  const [ movies ] = useState(MOVIES)
  const [ sortKey, setSortKey ] = useState<SortKey>('title')
  const [ directorFilter, setDirectorFilter ] = useState('')

  const displayedMovies = useMemo(
    () => {
      const filtered = directorFilter
        ? movies.filter(m => m.director === directorFilter)
        : movies

      return [ ...filtered ].sort((a, b) => {
        if (sortKey === 'year') return a.year - b.year
        return a[sortKey].localeCompare(b[sortKey])
      })
    },
    [ movies, sortKey, directorFilter ]
  )

  const renderControls = (): ReactElement =>
    <div className='movies-controls'>
      <SelectCustom
        id='sort'
        label='Sort by'
        onChange={e => { setSortKey(e.target.value as SortKey) }}
        options={[
          { value: 'title', label: 'Name' },
          { value: 'year', label: 'Year' },
          { value: 'director', label: 'Director' }
        ]}
        value={sortKey}
      />
      <SelectCustom
        id='director'
        label='Director'
        onChange={e => { setDirectorFilter(e.target.value) }}
        options={[
          { value: '', label: 'All' },
          ...DIRECTORS.map(d => ({ value: d, label: d }))
        ]}
        value={directorFilter}
      />
    </div>

  const renderMovieList = (): ReactElement =>
    <FlexWrapper
      backgroundColor='#fff'
      hasShadow
    >
      <Spacer
        b={2.5}
        isFlex
        l={2.5}
        r={2.5}
        t={2.5}
      >
        <FlexWrapper flexColumn>
          <Spacer
            b={2}
            l={0}
            r={0}
            t={0}
          >
            <TagH size={2}>
              Films
            </TagH>
          </Spacer>
          { renderControls() }
          <ul className='movies-list'>
            { displayedMovies.map(({ title, year, director, favorite }) => (
              <li
                className={`movie-item${favorite ? ' movie-item--favorite' : ''}`}
                key={title}
              >
                <div className='movie-primary'>
                  { favorite && <span className='movie-star'>&#9733;</span> }
                  <span className='movie-title'>{ title }</span>
                  <span className='movie-year'>{ year }</span>
                </div>
                <div className='movie-director'>{ director }</div>
              </li>
            )) }
          </ul>
        </FlexWrapper>
      </Spacer>
    </FlexWrapper>

  const renderIntro = (): ReactElement =>
    <FlexWrapper
      backgroundColor='#fff'
      hasShadow
    >
      <Spacer
        b={2.5}
        isFlex
        l={2.5}
        r={2.5}
        t={2.5}
      >
        <FlexWrapper flexColumn>
          <Spacer
            b={2}
            l={0}
            r={0}
            t={0}
          >
            <TagH size={2}>
              Movies
            </TagH>
          </Spacer>
          <TagP>
            A personal list of films I keep coming back to. Starred titles are favorites.
          </TagP>
        </FlexWrapper>
      </Spacer>
    </FlexWrapper>

  const renderContent = (): ReactElement =>
    <Spacer
      l={2.5}
      r={2.5}
      t={0}
    >
      <Spacer
        b={2.5}
        l={0}
        r={0}
        t={0}
      >
        { renderIntro() }
      </Spacer>
      <Spacer
        b={2.5}
        l={0}
        r={0}
        t={0}
      >
        { renderMovieList() }
      </Spacer>
    </Spacer>

  return (
    <PageRow>
      <Container>
        <MoviesContentStyled className={`fade-in ${isNavigating ? 'fade-out' : ''}`}>
          { renderContent() }
        </MoviesContentStyled>
      </Container>
    </PageRow>
  )
}

export default MoviesContent
