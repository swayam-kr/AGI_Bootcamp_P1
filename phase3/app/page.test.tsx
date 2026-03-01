import { render, screen, fireEvent } from "@testing-library/react";
import Home from "./page";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Phase 3 - Frontend Dashboard", () => {
    beforeEach(() => {
        mock.reset();
    });

    it("renders the main heading and search components", () => {
        render(<Home />);
        expect(screen.getByText(/The Perfect Dining Spot/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g. BTM, MG Road/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Get Recommendations/i })).toBeInTheDocument();
    });

    it("displays recommendations when results are returned from backend", async () => {
        const mockData = {
            candidates: [
                {
                    name: "Swayam Diner",
                    rating_clean: 4.8,
                    cost_clean: 500,
                    area_clean: "BTM",
                    cuisines: "Italian, Pasta"
                }
            ],
            ai_rationale: "This is a great match for your pasta cravings!"
        };

        mock.onPost("http://127.0.0.1:8000/recommend").reply(200, mockData);

        render(<Home />);

        // 1. Fill some fields
        const areaInput = screen.getByPlaceholderText(/e.g. BTM, MG Road/i);
        fireEvent.change(areaInput, { target: { value: "BTM" } });

        // 2. Click search
        const searchBtn = screen.getByRole("button", { name: /Get Recommendations/i });
        fireEvent.click(searchBtn);

        // 3. Verify results appear
        const rationaleHeader = await screen.findByText(/AI Expert Insight/i);
        expect(rationaleHeader).toBeInTheDocument();
        expect(screen.getByText(/This is a great match for your pasta cravings!/i)).toBeInTheDocument();
        expect(screen.getByText(/Swayam Diner/i)).toBeInTheDocument();
    });

    it("shows an error message when the backend connection fails", async () => {
        mock.onPost("http://127.0.0.1:8000/recommend").networkError();

        render(<Home />);
        const searchBtn = screen.getByRole("button", { name: /Get Recommendations/i });
        fireEvent.click(searchBtn);

        const errorMsg = await screen.findByText(/Could not connect to the backend server/i);
        expect(errorMsg).toBeInTheDocument();
    });
});
