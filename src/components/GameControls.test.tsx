import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { GameControls } from './GameControls'

describe('GameControls', () => {
  describe('Button functionality', () => {
    it('renders Sink and Miss buttons', () => {
      render(
        <GameControls
          onRecordSink={() => {}}
          onRecordMiss={() => {}}
        />
      )

      expect(screen.getByRole('button', { name: /sink/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /miss/i })).toBeInTheDocument()
    })

    it('calls onRecordSink when Sink button is clicked', async () => {
      const user = userEvent.setup()
      const onRecordSink = vi.fn()
      
      render(
        <GameControls
          onRecordSink={onRecordSink}
          onRecordMiss={() => {}}
        />
      )

      const sinkButton = screen.getByRole('button', { name: /sink/i })
      await user.click(sinkButton)
      
      expect(onRecordSink).toHaveBeenCalledOnce()
    })

    it('calls onRecordMiss when Miss button is clicked', async () => {
      const user = userEvent.setup()
      const onRecordMiss = vi.fn()
      
      render(
        <GameControls
          onRecordSink={() => {}}
          onRecordMiss={onRecordMiss}
        />
      )

      const missButton = screen.getByRole('button', { name: /miss/i })
      await user.click(missButton)
      
      expect(onRecordMiss).toHaveBeenCalledOnce()
    })
  })

  describe('Disabled state', () => {
    it('disables both buttons when disabled prop is true', () => {
      render(
        <GameControls
          onRecordSink={() => {}}
          onRecordMiss={() => {}}
          disabled={true}
        />
      )

      const sinkButton = screen.getByRole('button', { name: /sink/i })
      const missButton = screen.getByRole('button', { name: /miss/i })
      
      expect(sinkButton).toBeDisabled()
      expect(missButton).toBeDisabled()
    })

    it('enables both buttons when disabled prop is false', () => {
      render(
        <GameControls
          onRecordSink={() => {}}
          onRecordMiss={() => {}}
          disabled={false}
        />
      )

      const sinkButton = screen.getByRole('button', { name: /sink/i })
      const missButton = screen.getByRole('button', { name: /miss/i })
      
      expect(sinkButton).not.toBeDisabled()
      expect(missButton).not.toBeDisabled()
    })

    it('does not call handlers when buttons are disabled', async () => {
      const user = userEvent.setup()
      const onRecordSink = vi.fn()
      const onRecordMiss = vi.fn()
      
      render(
        <GameControls
          onRecordSink={onRecordSink}
          onRecordMiss={onRecordMiss}
          disabled={true}
        />
      )

      const sinkButton = screen.getByRole('button', { name: /sink/i })
      const missButton = screen.getByRole('button', { name: /miss/i })
      
      await user.click(sinkButton)
      await user.click(missButton)
      
      expect(onRecordSink).not.toHaveBeenCalled()
      expect(onRecordMiss).not.toHaveBeenCalled()
    })
  })

  describe('Session complete state', () => {
    it('shows completion message when sessionComplete is true', () => {
      render(
        <GameControls
          onRecordSink={() => {}}
          onRecordMiss={() => {}}
          sessionComplete={true}
        />
      )

      expect(screen.getByText(/session complete/i)).toBeInTheDocument()
      expect(screen.getByText(/close the completion dialog/i)).toBeInTheDocument()
    })

    it('does not show completion message when sessionComplete is false', () => {
      render(
        <GameControls
          onRecordSink={() => {}}
          onRecordMiss={() => {}}
          sessionComplete={false}
        />
      )

      expect(screen.queryByText(/session complete/i)).not.toBeInTheDocument()
    })

    it('disables buttons when sessionComplete is true and disabled is true', () => {
      render(
        <GameControls
          onRecordSink={() => {}}
          onRecordMiss={() => {}}
          disabled={true}
          sessionComplete={true}
        />
      )

      const sinkButton = screen.getByRole('button', { name: /sink/i })
      const missButton = screen.getByRole('button', { name: /miss/i })
      
      expect(sinkButton).toBeDisabled()
      expect(missButton).toBeDisabled()
    })
  })
})
