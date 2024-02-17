import React, { useState, useEffect } from "react";
import styles from "@/styles/Home.module.css";

interface ProgressBarProps {
    value: number;
    max: number;
    color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color }) => {
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
                border: `1px solid ${color}`,
                width: "100%",
                // height: "100%",
                borderRadius: "10px",
                overflow: "hidden",
            }}
            className={styles.progressMain}
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
