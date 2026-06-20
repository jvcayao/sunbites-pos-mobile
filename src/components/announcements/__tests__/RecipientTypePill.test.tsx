import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { PaperProvider } from 'react-native-paper'
import { RecipientTypePill } from '../RecipientTypePill'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>
}

describe('RecipientTypePill', () => {
  it('renders Parents and Staff options', () => {
    render(
      <RecipientTypePill value="parents" onChange={jest.fn()} />,
      { wrapper: Wrapper },
    )
    expect(screen.getByText('Parents')).toBeTruthy()
    expect(screen.getByText('Staff')).toBeTruthy()
  })

  it('calls onChange with parents when Parents is pressed', () => {
    const onChange = jest.fn()
    render(
      <RecipientTypePill value="staff" onChange={onChange} />,
      { wrapper: Wrapper },
    )
    fireEvent.press(screen.getByTestId('pill-parents'))
    expect(onChange).toHaveBeenCalledWith('parents')
  })

  it('calls onChange with staff when Staff is pressed', () => {
    const onChange = jest.fn()
    render(
      <RecipientTypePill value="parents" onChange={onChange} />,
      { wrapper: Wrapper },
    )
    fireEvent.press(screen.getByTestId('pill-staff'))
    expect(onChange).toHaveBeenCalledWith('staff')
  })

  it('does not call onChange when active pill is pressed again', () => {
    const onChange = jest.fn()
    render(
      <RecipientTypePill value="parents" onChange={onChange} />,
      { wrapper: Wrapper },
    )
    fireEvent.press(screen.getByTestId('pill-parents'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not call onChange when pressing the already-selected Parents again', () => {
    const onChange = jest.fn()
    render(
      <RecipientTypePill value="parents" onChange={onChange} />,
      { wrapper: Wrapper },
    )
    fireEvent.press(screen.getByTestId('pill-parents'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not call onChange when pressing the already-selected Staff again', () => {
    const onChange = jest.fn()
    render(
      <RecipientTypePill value="staff" onChange={onChange} />,
      { wrapper: Wrapper },
    )
    fireEvent.press(screen.getByTestId('pill-staff'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
