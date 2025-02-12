import type React from "react"
import { motion } from "framer-motion"
import { Card } from "@repo/design-system/components/ui/card"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedCard({ children, className, ...props }: AnimatedCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} whileTap={{ scale: 0.95 }}>
      <Card
        className={`${className} transition-shadow hover:shadow-lg`}
        style={{
          background: "linear-gradient(145deg, var(--card-background) 0%, var(--card-background-lighter) 100%)",
        }}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}

