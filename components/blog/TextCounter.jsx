"use client"

export default function TextCounter({ text = "", type = "characters", ideal = null, max = null }) {
  const count = type === "words" 
    ? (text ? text.trim().split(/\s+/).filter(Boolean).length : 0)
    : (text ? text.length : 0)

  const getColor = () => {
    if (!ideal && !max) return "text-muted-foreground"
    
    if (ideal) {
      if (count >= ideal.min && count <= ideal.max) return "text-green-600"
      if (count < ideal.min || count > ideal.max) return "text-amber-600"
    }
    
    if (max && count > max) return "text-red-600"
    
    return "text-muted-foreground"
  }

  const getMessage = () => {
    if (!ideal && !max) return `${count} ${type}`
    
    let msg = `${count} ${type}`
    
    if (ideal) {
      if (count < ideal.min) {
        msg += ` • Aim for ${ideal.min}-${ideal.max}`
      } else if (count > ideal.max) {
        msg += ` • Try to keep under ${ideal.max}`
      } else {
        msg += " • Perfect! ✓"
      }
    }
    
    if (max && count > max) {
      msg += ` • Exceeds maximum of ${max}`
    }
    
    return msg
  }

  return (
    <p className={`text-xs mt-1 ${getColor()}`}>
      {getMessage()}
    </p>
  )
}
