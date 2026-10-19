import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { Header } from "./header";

test("renders brand link and the new request action", () => {
  renderWithProviders(<Header />);
  expect(screen.getByRole("link", { name: "Заявки на ремонт" })).toHaveAttribute(
    "href",
    "/requests",
  );
  expect(screen.getByRole("link", { name: "Новая заявка" })).toHaveAttribute(
    "href",
    "/requests/new",
  );
});

test("hides the new request action on the form page", () => {
  renderWithProviders(<Header />, "/requests/new");
  expect(screen.queryByRole("link", { name: "Новая заявка" })).not.toBeInTheDocument();
});
