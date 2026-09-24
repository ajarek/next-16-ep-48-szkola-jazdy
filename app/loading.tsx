import { Loader2 } from "lucide-react"

const Loading = () => {
  return (
    <div className='w-full min-h-screen  flex flex-col items-center justify-center '>
      <Loader2 className='h-10 w-10 animate-spin  text-primary' />
      <p className='text-primary font-rajdhani'>Wczytywanie...</p>
    </div>
  )
}

export default Loading
