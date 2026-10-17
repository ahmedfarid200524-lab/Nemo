
import { NavLink } from 'react-router-dom'

const navbar = () => {
  return (
    <>
          <nav className="glass-nav" aria-label="Main navigation">
  <NavLink to='/Home'  aria-label="Home">
    <svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>
  </NavLink>
   <NavLink to='/Addpost' aria-label="Add">
    <svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
  </NavLink>
  <NavLink to='/Profile' aria-label="Profile">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
  </NavLink>
</nav>
    </>
  )
}

export default navbar