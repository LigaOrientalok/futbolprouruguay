import { expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { QuickActions } from "@/components/dashboard/quick-actions"

test("QuickActions renders all action links", () => {
  render(<QuickActions />)

  expect(screen.getByText("Buscar jugadores")).toBeDefined()
  expect(screen.getByText("Crear equipo")).toBeDefined()
  expect(screen.getByText("Publicar oportunidad")).toBeDefined()
  expect(screen.getByText("Ver feed")).toBeDefined()
  expect(screen.getByText("Mensajes")).toBeDefined()
})

test("QuickActions links have correct hrefs", () => {
  render(<QuickActions />)

  const searchLink = screen.getByText("Buscar jugadores").closest("a")
  expect(searchLink).toHaveAttribute("href", "/search")

  const teamLink = screen.getByText("Crear equipo").closest("a")
  expect(teamLink).toHaveAttribute("href", "/teams/new")
})
