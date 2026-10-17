
import { DotLoader } from 'react-spinners'

const Loader = () => {
  return (
    <div className="bg-black min-vh-100 d-flex justify-content-center align-items-center">
      <DotLoader color="white" />
    </div>
  )
}

export default Loader