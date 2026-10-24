import { screen } from "@testing-library/react";
import { renderWithProviders, residentUser } from "@/test/test-utils";
import { Header } from "./header";

test("renders brand link, role navigation and the user menu", () => {
  renderWithProviders(<Header containerClassName="" />);
  expect(screen.getByRole("link", { name: "Заявки на ремонт" })).toHaveAttribute(
    "href",
    "/requests",
  );
  expect(screen.getByRole("link", { name: "Мои заявки" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Иван Петров, меню пользователя" })).toHaveTextContent(
    "Иван Петров",
  );
});

test("labels the requests navigation by role", () => {
  renderWithProviders(<Header containerClassName="" />, {
    user: { ...residentUser, role: "dispatcher" },
  });
  expect(screen.getByRole("link", { name: "Заявки" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Мои заявки" })).not.toBeInTheDocument();
});
