import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { Person, PhoneLink } from "./person";

test("shows initials, a link to the profile and the phone as a tel link", () => {
  renderWithProviders(
    <Person
      name="Сергей Кузнецов"
      href="/users/4"
      badge="это вы"
      detail={<PhoneLink phone="+7 900 000-00-00" />}
    />,
  );
  expect(screen.getByText("СК")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Сергей Кузнецов" })).toHaveAttribute("href", "/users/4");
  expect(screen.getByText("это вы")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "+7 900 000-00-00" })).toHaveAttribute(
    "href",
    "tel:+7 900 000-00-00",
  );
});
