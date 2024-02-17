import React, { useState, useEffect } from "react";
import styles from "@/styles/Home.module.css";

interface ProgressBarProps {
    value: number;
    max: number;
    color: string;
    width: number;
    height: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max,
    color,
    width,
    height,
}) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const calculateProgress = () => {
            const percentage = (value / max) * 100;
            setProgress(percentage);
        };

        calculateProgress();
    }, [value, max]);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                borderRadius: "10px",
                border: `1px solid ${color}`,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    width: `${progress}%`,
                    height: "100%",
                    backgroundColor: color,
                }}
                className={styles.progressFill}
            />
        </div>
    );
};

export default ProgressBar;
