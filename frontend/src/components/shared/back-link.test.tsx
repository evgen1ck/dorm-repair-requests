import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { renderWithProviders } from "@/test/test-utils";
import { BackLink } from "./back-link";

const renderPage = (content: React.ReactNode) =>
  renderWithProviders(
    <Routes>
      <Route path="/requests" element={<p>Список заявок</p>} />
      <Route path="/requests/7" element={content} />
    </Routes>,
    { route: "/requests/7" },
  );

test("escape goes to the fallback when there is no in-app history", async () => {
  renderPage(
    <BackLink to="/requests" escape>
      К заявкам
    </BackLink>,
  );
  expect(screen.getByRole("link", { name: "К заявкам" })).toHaveAttribute("href", "/requests");
  await userEvent.keyboard("{Escape}");
  expect(await screen.findByText("Список заявок")).toBeInTheDocument();
});

test("escape is ignored while focus is inside a form", async () => {
  renderPage(
    <main>
      <BackLink to="/requests" escape>
        К заявкам
      </BackLink>
      <form>
        <button type="button">Выбрать мастера</button>
      </form>
    </main>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Выбрать мастера" }));
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByText("Список заявок")).not.toBeInTheDocument();
});
