import React, { Component, createRef } from 'react';

class MatrixRain extends Component {
  private canvasRef = createRef<HTMLCanvasElement>();
  private animationFrameId: number = 0;
  private columns: number[] = [];

  componentDidMount() {
    const canvas = this.canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    this.columns = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      this.columns.forEach((y, i) => {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        const x = i * fontSize;
        ctx.fillText(text, x, y * fontSize);

        this.columns[i] = y > canvas.height / fontSize || Math.random() > 0.975 ? 0 : y + 1;
      });

      this.animationFrameId = requestAnimationFrame(draw);
    };

    draw();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationFrameId);
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        style={{
          display: 'block',
          background: 'black',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1
        }}
      />
    );
  }
}

export default MatrixRain;

