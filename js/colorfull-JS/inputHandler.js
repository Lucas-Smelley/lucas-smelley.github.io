let speed = 2;


addEventListener("keydown", function(e){

    if (e.code == 'KeyD'){
        player.vxr = speed;
    }
    if (e.code == 'KeyA'){
        player.vxl = -speed;
    }
    if (e.code == 'KeyS'){
        player.vy = speed;
    }
    if (e.code == 'KeyW'){
        player.vy = -speed;
    }
    if (e.code == 'KeyE'){
        if (enemiesEnabled){
            console.log('enemies disabled');
            enemiesEnabled = false;
        } else {
            console.log('enemies enabled');
            enemiesEnabled = true;
            spawnEnemiesAgain = true;
        }
    }
    
    if (e.code == 'KeyR'){
        restartGame = true;
    }
})

addEventListener("keyup", function(e){


    if (e.code == 'KeyD'){
        player.vxr = 0;
    }
    if (e.code == 'KeyA'){
        player.vxl = 0;
    }
    if (e.code == 'KeyS'){
        player.vy = 0;
    }
    if (e.code == 'KeyW'){
        player.vy = 0;
    }
})
