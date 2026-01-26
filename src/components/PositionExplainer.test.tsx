import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PositionExplainer } from './PositionExplainer'

describe('PositionExplainer', () => {
  describe('Rendering', () => {
    it('renders the X/Y format correctly', () => {
      render(<PositionExplainer putts={3} carryover={1} />)
      
      expect(screen.getByText('3/1')).toBeInTheDocument()
    })

    it('renders with info icon', () => {
      render(<PositionExplainer putts={3} carryover={1} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('border-2', 'border-green-500')
    })
  })

  describe('Pluralization', () => {
    it('uses singular "putt" when putts=1', () => {
      render(<PositionExplainer putts={1} carryover={0} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('1 putt'))
    })

    it('uses plural "putts" when putts>1', () => {
      render(<PositionExplainer putts={3} carryover={1} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('3 putts'))
    })

    it('uses singular "shot" when carryover=1', () => {
      render(<PositionExplainer putts={3} carryover={1} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('1 shot remaining'))
    })

    it('uses plural "shots" when carryover>1', () => {
      render(<PositionExplainer putts={2} carryover={3} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('3 shots remaining'))
    })

    it('uses plural "shots" when carryover=0', () => {
      render(<PositionExplainer putts={4} carryover={0} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('0 shots remaining'))
    })
  })

  describe('Accessibility', () => {
    it('has descriptive aria-label on button', () => {
      render(<PositionExplainer putts={3} carryover={1} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button.getAttribute('aria-label')).toContain('Position completed')
      expect(button.getAttribute('aria-label')).toContain('Click for details')
    })

    it('button is keyboard accessible', () => {
      render(<PositionExplainer putts={3} carryover={1} />)
      
      const button = screen.getByRole('button')
      expect(button).not.toHaveAttribute('disabled')
    })
  })

  describe('Content Variations', () => {
    it('shows different formats correctly', () => {
      const { rerender } = render(<PositionExplainer putts={3} carryover={1} />)
      expect(screen.getByText('3/1')).toBeInTheDocument()
      
      rerender(<PositionExplainer putts={4} carryover={0} />)
      expect(screen.getByText('4/0')).toBeInTheDocument()
      
      rerender(<PositionExplainer putts={2} carryover={3} />)
      expect(screen.getByText('2/3')).toBeInTheDocument()
    })
  })

  describe('Visual Styling', () => {
    it('applies correct styling classes', () => {
      render(<PositionExplainer putts={3} carryover={1} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-2')
      expect(button).toHaveClass('border-green-500')
      expect(button).toHaveClass('rounded-full')
      expect(button).toHaveClass('hover:bg-green-50')
    })
  })
})
