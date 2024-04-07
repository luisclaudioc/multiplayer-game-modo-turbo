class Player {
  constructor({x, y, score, id, vel, avatar}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.vel = vel;
    this.avatar = avatar;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case "ArrowUp":
      case "w":
      case "W":
        if (this.y > 50 && this.x >= 32.5 && this.x <= 572.5) this.y -= speed;
      break;
      case "ArrowDown":
      case "s":
      case "S":
        if (this.y < 390 && this.x >= 32.5 && this.x <= 572.5) this.y += speed;
        else if (this.y === 390 && this.y < 400 && ( this.x <= 232.5 || this.x >= 352.5 )) this.y += speed;
      break;
      case "ArrowRight":
      case "d":
      case "D":
        if (this.y === 230 && this.x < 580) this.x += speed;
        else if (this.y === 230 && this.x >= 580) this.x = -7.5;
        else if (this.y === 410 && ( this.x < 232.5 || this.x >= 352.5 ) && this.x < 550) this.x += speed;
        else if (this.y !== 410 && this.x < 550) this.x += speed;
      break;
      case "ArrowLeft":
      case "a": 
      case "A":
        if (this.y === 230 && this.x > 0) this.x -= speed;
        else if (this.y === 230 && this.x <= 0) this.x = 592.5;
        else if (this.y === 410 && ( this.x <= 232.5 || this.x > 352.5 ) && this.x > 32.5) this.x -= speed;
        else if (this.y !== 410 && this.x > 32.5) this.x -= speed;
      break;
      default:
      break;
    }
  }

  collision(item) {
    if ((Math.abs(item.x - this.x) < 20 && Math.abs(item.y - this.y) < 30)) return true
    return false;
  }

  calculateRank(arr) {
    let allPlayers = arr.map(player => player.playerObj).filter(player => player.avatar);
    let sortedPlayers = allPlayers.sort((a, b) => b.score - a.score);
    let rankPosition = sortedPlayers.findIndex((obj) => obj.score === this.score) + 1
    return rankPosition.toString() + ' / ' + allPlayers.length.toString();
  }
}

export default Player;
