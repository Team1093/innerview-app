import nextIcon from '../images/nextIcon.svg'

export default function NextIcon({ size }: { size: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        bottom: '20px',
        cursor: 'pointer',
        zIndex: 1
      }}
    >
      <img src={nextIcon} alt="next" width={size} height={size} />
    </div>
  )
}
