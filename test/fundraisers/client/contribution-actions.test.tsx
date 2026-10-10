// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ContributionActions from "@/features/fundraisers/ContributionActions";

vi.mock("@/components/forms/fundraisers/EditContributionDialog", () => ({
	default: ({
		contribution,
		open,
		onOpenChange,
	}: {
		contribution: { id: string };
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}) =>
		open ? (
			<div>
				<span>Edit Contribution Dialog</span>
				<span>Contribution ID: {contribution.id}</span>
				<button onClick={() => onOpenChange(false)}>Close Edit</button>
			</div>
		) : null,
}));

vi.mock("@/components/forms/fundraisers/DeleteContributionDialog", () => ({
	default: ({
		contribution,
		open,
		onOpenChange,
	}: {
		contribution: { id: string };
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}) =>
		open ? (
			<div>
				<span>Delete Contribution Dialog</span>
				<span>Contribution ID: {contribution.id}</span>
				<button onClick={() => onOpenChange(false)}>Close Delete</button>
			</div>
		) : null,
}));
const contribution = {
	id: "contribution-1",
} as never;

beforeEach(() => {
	vi.clearAllMocks();
});
afterEach(() => {
	cleanup();
});

describe("ContributionActions", () => {
	it("renders the contribution actions menu", () => {
		render(<ContributionActions contribution={contribution} />);

		expect(screen.getByRole("button")).toBeInTheDocument();
		expect(
			screen.queryByText("Edit Contribution Dialog"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText("Delete Contribution Dialog"),
		).not.toBeInTheDocument();
	});
	it("opens the edit dialog when Edit is clicked", async () => {
		const user = userEvent.setup();

		render(<ContributionActions contribution={contribution} />);

		await user.click(screen.getByRole("button"));
		expect(
			await screen.findByRole("menuitem", { name: "Edit" }),
		).toBeInTheDocument();
		await user.click(screen.getByRole("menuitem", { name: "Edit" }));

		expect(screen.getByText("Edit Contribution Dialog")).toBeInTheDocument();

		expect(
			screen.queryByText("Delete Contribution Dialog"),
		).not.toBeInTheDocument();
	});

	it("opens the delete dialog when Delete is clicked", async () => {
		const user = userEvent.setup();

		render(<ContributionActions contribution={contribution} />);

		await user.click(screen.getByRole("button"));
		await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

		expect(screen.getByText("Delete Contribution Dialog")).toBeInTheDocument();

		expect(
			screen.queryByText("Edit Contribution Dialog"),
		).not.toBeInTheDocument();
	});
	it("closes the edit dialog when onOpenChange is called with false", async () => {
		const user = userEvent.setup();

		render(<ContributionActions contribution={contribution} />);

		await user.click(screen.getByRole("button"));
		await user.click(await screen.findByRole("menuitem", { name: "Edit" }));

		expect(screen.getByText("Edit Contribution Dialog")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Close Edit" }));

		expect(
			screen.queryByText("Edit Contribution Dialog"),
		).not.toBeInTheDocument();
	});
	it("closes the delete dialog when onOpenChange is called with false", async () => {
		const user = userEvent.setup();

		render(<ContributionActions contribution={contribution} />);

		await user.click(screen.getByRole("button"));
		await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

		expect(screen.getByText("Delete Contribution Dialog")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Close Delete" }));

		expect(
			screen.queryByText("Delete Contribution Dialog"),
		).not.toBeInTheDocument();
	});

	it("passes the correct contribution to the edit dialog", async () => {
		const user = userEvent.setup();

		render(<ContributionActions contribution={contribution} />);

		await user.click(screen.getByRole("button"));
		await user.click(await screen.findByRole("menuitem", { name: "Edit" }));

		expect(
			screen.getByText("Contribution ID: contribution-1"),
		).toBeInTheDocument();
	});
});
