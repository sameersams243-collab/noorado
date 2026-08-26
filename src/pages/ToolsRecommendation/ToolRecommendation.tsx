import { Link } from "react-router-dom";
import "./ToolRecommendation.css";

type ToolRecommendationProps = {
	title?: string;
	description?: string;
	buttonText?: string;
	path?: string;
};

function ToolRecommendation({
	title = "Need to create an invoice?",
	description = "Your GST calculation is ready. Create a professional GST invoice in a few simple steps.",
	buttonText = "Create GST Invoice →",
	path = "/tools/gst-invoice-generator",
}: ToolRecommendationProps) {
	return (
		<div className="tool-recommendation">
			<div className="tool-recommendation-content">
				<span className="tool-recommendation-label">
					RECOMMENDED FOR YOU
				</span>

				<h3>{title}</h3>

				<p>{description}</p>
			</div>

			<Link to={path} className="tool-recommendation-button">
				{buttonText}
			</Link>
		</div>
	);
}

export default ToolRecommendation;
