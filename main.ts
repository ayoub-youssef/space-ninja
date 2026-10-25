namespace SpriteKind {
    export const UI = SpriteKind.create()
    export const Boss = SpriteKind.create()
    export const attackSpeedBoost = SpriteKind.create()
    export const movSpeedBoost = SpriteKind.create()
    export const bulletSizeBoost = SpriteKind.create()
    export const bossBullet = SpriteKind.create()
    export const bossBanana = SpriteKind.create()
    export const empty = SpriteKind.create()
    export const healthBoost = SpriteKind.create()
    export const shieldBoost = SpriteKind.create()
    export const playerShield = SpriteKind.create()
    export const godMode = SpriteKind.create()
    export const finalBoss = SpriteKind.create()
    export const bossLaser = SpriteKind.create()
    export const bossKnives = SpriteKind.create()
}
namespace StatusBarKind {
    export const Label = StatusBarKind.create()
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.shieldBoost, function (sprite, otherSprite) {
    music.play(music.createSoundEffect(WaveShape.Sine, 1801, 3852, 255, 0, 500, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    if (shielded == 0) {
        playerShield = sprites.create(assets.image`playerShield`, SpriteKind.playerShield)
        playerShield.setPosition(spaceship.x - 1, spaceship.y)
        playerShield.z = comboSprite.z - 1
        shielded = 1
    } else {
        info.changeScoreBy((scoreMulti + combo) * 5)
    }
    sprites.destroy(otherSprite)
})
sprites.onOverlap(SpriteKind.playerShield, SpriteKind.bossKnives, function (sprite, otherSprite) {
    otherSprite.setVelocity(0, 0)
    sprites.destroy(sprite, effects.bubbles, 100)
    music.play(music.createSoundEffect(WaveShape.Sine, 4699, 1133, 255, 0, 500, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    shielded = 0
    godMode = 1
    timer.after(500, function () {
        godMode = 0
    })
    sprites.destroy(otherSprite, effects.spray, 100)
    scene.cameraShake(3, 500)
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (startGame == -1) {
        if (paused == 0) {
            color.startFadeFromCurrent(color.GrayScale, 100)
            pausedText = textsprite.create("PAUSED", 15, 4)
            pausedText.setOutline(2, 1)
            pausedText.setMaxFontHeight(16)
            pausedText.setPosition(80, 60)
            color.pauseUntilFadeDone()
            paused = 1
        } else {
            paused = 0
            sprites.destroy(pausedText)
            color.startFadeFromCurrent(color.originalPalette, 100)
            color.pauseUntilFadeDone()
            scroller.scrollBackgroundWithSpeed(50, 0)
            if (boss == 0 && finalBoss == 0) {
                info.startCountdown(timer2)
            }
        }
    }
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (mainMenu == 1) {
        music.stopAllSounds()
        music.play(music.createSoundEffect(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        color.startFadeFromCurrent(color.Black, 500)
        color.pauseUntilFadeDone()
        sprites.destroyAllSpritesOfKind(SpriteKind.Text)
        sprites.destroyAllSpritesOfKind(SpriteKind.UI)
        mainMenu = -1
        characterSetup = 1
    }
    if (characterSetup == -1) {
        music.stopAllSounds()
        music.play(music.createSoundEffect(WaveShape.Noise, 1, 5000, 255, 0, 500, SoundExpressionEffect.Tremolo, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
        color.startFadeFromCurrent(color.Black, 500)
        color.pauseUntilFadeDone()
        sprites.destroyAllSpritesOfKind(SpriteKind.UI)
        characterSetup = -2
        startGame = 1
        music2 = 1
    }
    if (startGame == -1) {
        if (pauseAttack == 0) {
            if (gameOver == 0) {
                music.play(music.melodyPlayable(music.pewPew), music.PlaybackMode.InBackground)
                bullet = sprites.createProjectileFromSprite(assets.image`bullet`, spaceship, bulletSpeed * -1, 0)
                bullet.setScale(bulletSize, ScaleAnchor.Middle)
                bulletList.push(bullet)
                pauseAttack = 1
                timer.after(attackRate, function () {
                    pauseAttack = 0
                })
            }
        }
    }
})
sprites.onOverlap(SpriteKind.playerShield, SpriteKind.bossLaser, function (sprite, otherSprite) {
    otherSprite.setVelocity(0, 0)
    sprites.destroy(sprite, effects.bubbles, 100)
    music.play(music.createSoundEffect(WaveShape.Sine, 4699, 1133, 255, 0, 500, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    shielded = 0
    godMode = 1
    timer.after(500, function () {
        godMode = 0
    })
    sprites.destroy(otherSprite, effects.spray, 100)
    scene.cameraShake(3, 500)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Boss, function (sprite, otherSprite) {
    sprite.setVelocity(0, 0)
    animation.runImageAnimation(
    sprite,
    assets.animation`bulletExplosion`,
    100,
    false
    )
    combo += 1
    if (bossHPBar.value >= 2) {
        pause(200)
        sprites.destroy(sprite)
        bossHPBar.value += -1
        music.play(music.melodyPlayable(music.thump), music.PlaybackMode.InBackground)
        scene.cameraShake(6, 200)
    } else {
        bossesKilled += 1
        boss = -4
        otherSprite.setVelocity(0, 30)
        sprites.destroy(bossHPBar, effects.spray, 250)
        sprites.destroy(bossHPBarLabel, effects.spray, 250)
        music.play(music.melodyPlayable(music.zapped), music.PlaybackMode.InBackground)
        sprites.destroy(sprite)
        otherSprite.startEffect(effects.fire, 3000)
        otherSprite.startEffect(effects.ashes, 3000)
        sprites.destroy(otherSprite, effects.spray, 3000)
        scene.cameraShake(8, 5000)
        if (bossType == 0) {
            info.changeScoreBy(scoreMulti * (5 + bossesKilled))
            for (let index = 0; index < 3; index++) {
                boost_attackSpeed = sprites.create(assets.image`attackSpeedBoost`, SpriteKind.attackSpeedBoost)
                boost_attackSpeed.setPosition(randint(20, 140), randint(25, 95))
                boost_attackSpeed.setVelocity(50, 50)
                boost_attackSpeed.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_attackSpeed,
                assets.animation`attackSpeedBoostAnim`,
                100,
                true
                )
                boost_attackSpeed.follow(spaceship, 100)
                boost_movSpeed = sprites.create(assets.image`movementSpeedBoost`, SpriteKind.movSpeedBoost)
                boost_movSpeed.setPosition(randint(20, 140), randint(25, 95))
                boost_movSpeed.setVelocity(50, 50)
                boost_movSpeed.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_movSpeed,
                assets.animation`movementSpeedBoostAnim`,
                100,
                true
                )
                boost_movSpeed.follow(spaceship, 100)
                boost_bulletSize = sprites.create(assets.image`bulletSizeBoost`, SpriteKind.bulletSizeBoost)
                boost_bulletSize.setPosition(randint(20, 140), randint(25, 95))
                boost_bulletSize.setVelocity(50, 50)
                boost_bulletSize.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_bulletSize,
                assets.animation`bulletSizeBoostAnim`,
                100,
                true
                )
                boost_bulletSize.follow(spaceship, 100)
                boost_health = sprites.create(assets.image`heartBoost`, SpriteKind.healthBoost)
                boost_health.setPosition(randint(20, 140), randint(25, 95))
                boost_health.setVelocity(50, 50)
                boost_health.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_health,
                assets.animation`heartBoostIdle`,
                150,
                true
                )
                boost_health.follow(spaceship, 100)
                boost_shield = sprites.create(assets.image`shieldBoost`, SpriteKind.shieldBoost)
                boost_shield.setPosition(randint(20, 140), randint(25, 95))
                boost_shield.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
                boost_shield.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_shield,
                assets.animation`shieldBoostIdle`,
                100,
                true
                )
                boost_shield.follow(spaceship, 100)
            }
        } else if (bossType == 1) {
            info.changeScoreBy(scoreMulti * (5 + bossesKilled))
            if (Math.percentChance(Math.constrain(1 + bossesKilled * 1, 5, 50))) {
                boost_attackSpeed = sprites.create(assets.image`attackSpeedBoost`, SpriteKind.attackSpeedBoost)
                boost_attackSpeed.setPosition(randint(20, 140), randint(25, 95))
                boost_attackSpeed.setVelocity(50, 50)
                boost_attackSpeed.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_attackSpeed,
                assets.animation`attackSpeedBoostAnim`,
                100,
                true
                )
                boost_movSpeed = sprites.create(assets.image`movementSpeedBoost`, SpriteKind.movSpeedBoost)
                boost_movSpeed.setPosition(randint(20, 140), randint(25, 95))
                boost_movSpeed.setVelocity(50, 50)
                boost_movSpeed.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_movSpeed,
                assets.animation`movementSpeedBoostAnim`,
                100,
                true
                )
                boost_bulletSize = sprites.create(assets.image`bulletSizeBoost`, SpriteKind.bulletSizeBoost)
                boost_bulletSize.setPosition(randint(20, 140), randint(25, 95))
                boost_bulletSize.setVelocity(50, 50)
                boost_bulletSize.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_bulletSize,
                assets.animation`bulletSizeBoostAnim`,
                100,
                true
                )
                boost_health = sprites.create(assets.image`heartBoost`, SpriteKind.healthBoost)
                boost_health.setPosition(randint(20, 140), randint(25, 95))
                boost_health.setVelocity(50, 50)
                boost_health.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_health,
                assets.animation`heartBoostIdle`,
                150,
                true
                )
                boost_shield = sprites.create(assets.image`shieldBoost`, SpriteKind.shieldBoost)
                boost_shield.setPosition(randint(20, 140), randint(25, 95))
                boost_shield.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
                boost_shield.setBounceOnWall(true)
                animation.runImageAnimation(
                boost_shield,
                assets.animation`shieldBoostIdle`,
                100,
                true
                )
            }
        }
        timer.after(500, function () {
            sprites.destroyAllSpritesOfKind(SpriteKind.StatusBar)
            timer2 += (scoreMulti + combo) / 10
            info.startCountdown(timer2)
            music.stopAllSounds()
            boss = 0
            spawnRocks = 1
            sprites.destroyAllSpritesOfKind(SpriteKind.bossBanana, effects.spray, 100)
            sprites.destroyAllSpritesOfKind(SpriteKind.bossBullet, effects.spray, 100)
        })
    }
})
sprites.onCreated(SpriteKind.movSpeedBoost, function (sprite) {
    timer.after(2000, function () {
        sprites.destroy(sprite, effects.disintegrate, 100)
    })
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (characterSetup == -1) {
        if (cursorPos > 0) {
            animation.stopAnimation(animation.AnimationTypes.All, cursor)
            cursor.setPosition(cursor.x - 45, red.y + 30)
            animation.runMovementAnimation(
            cursor,
            animation.animationPresets(animation.bobbing),
            2000,
            true
            )
        }
    }
})
sprites.onCreated(SpriteKind.shieldBoost, function (sprite) {
    timer.after(2000, function () {
        sprites.destroy(sprite, effects.disintegrate, 100)
    })
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.bossLaser, function (sprite, otherSprite) {
    combo = 0
    controller.moveSprite(spaceship, 0, 0)
    timer.after(250, function () {
        controller.moveSprite(spaceship, playerSpeed, playerSpeed)
    })
    if (info.life() >= 2) {
        music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)
    } else {
        music.play(music.melodyPlayable(music.sonar), music.PlaybackMode.InBackground)
    }
    scene.cameraShake(8, 500)
    info.changeLifeBy(-1)
    info.changeScoreBy(Math.abs(scoreMulti - combo) * -3)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.healthBoost, function (sprite, otherSprite) {
    music.play(music.melodyPlayable(music.jumpUp), music.PlaybackMode.InBackground)
    playerHealth = info.life() + 1
    if (playerHealth > 10) {
        playerHealth += -1
        info.changeScoreBy((scoreMulti + combo) * 10)
    }
    info.setLife(playerHealth)
    sprites.destroy(otherSprite)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.finalBoss, function (sprite, otherSprite) {
    sprite.setVelocity(0, 0)
    animation.runImageAnimation(
    sprite,
    assets.animation`bulletExplosion`,
    100,
    false
    )
    combo += 1
    if (bossHPBar.value >= 2) {
        pause(200)
        sprites.destroy(sprite)
        bossHPBar.value += -1
        music.play(music.melodyPlayable(music.thump), music.PlaybackMode.InBackground)
        scene.cameraShake(6, 200)
    } else {
        music2 = 0
        music.stopAllSounds()
        music.play(music.melodyPlayable(music.sonar), music.PlaybackMode.InBackground)
        scene.cameraShake(8, 5000)
        bossSprite.setVelocity(15, 50)
        sprites.destroy(bossSprite, effects.fire, 5000)
        timer.after(3000, function () {
            game.showLongText("Wow you actually beat that thing", DialogLayout.Bottom)
            game.showLongText("well done", DialogLayout.Bottom)
            info.setScore(9999999)
            blockSettings.writeNumber("High Score", info.score())
            game.setGameOverMessage(true, "Highest Score:" + convertToText(blockSettings.readNumber("High Score")))
            game.gameOver(true)
        })
    }
})
info.onCountdownEnd(function () {
    gameOver = 1
    music2 = 0
    music.stopAllSounds()
    info.setScore(highScore)
    game.setGameOverMessage(false, "Highest Score:" + convertToText(blockSettings.readNumber("High Score")))
    game.gameOver(false)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.bossKnives, function (sprite, otherSprite) {
    combo = 0
    controller.moveSprite(spaceship, 0, 0)
    timer.after(250, function () {
        controller.moveSprite(spaceship, playerSpeed, playerSpeed)
    })
    otherSprite.setVelocity(0, 0)
    if (info.life() >= 2) {
        music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)
    } else {
        music.play(music.melodyPlayable(music.sonar), music.PlaybackMode.InBackground)
    }
    scene.cameraShake(8, 500)
    info.changeLifeBy(-1)
    info.changeScoreBy(Math.abs(scoreMulti - combo) * -3)
    sprites.destroy(otherSprite, effects.spray, 100)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.attackSpeedBoost, function (sprite, otherSprite) {
    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
    attackRate += attackRate * 2 / 100 * -1
    sprites.destroy(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.movSpeedBoost, function (sprite, otherSprite) {
    playerSpeed = Math.constrain(playerSpeed + playerSpeed * 2 / 100, 0, 200)
    music.play(music.melodyPlayable(music.magicWand), music.PlaybackMode.InBackground)
    controller.moveSprite(spaceship, playerSpeed, playerSpeed)
    sprites.destroy(otherSprite)
})
sprites.onOverlap(SpriteKind.playerShield, SpriteKind.bossBullet, function (sprite, otherSprite) {
    otherSprite.setVelocity(0, 0)
    sprites.destroy(sprite, effects.bubbles, 100)
    music.play(music.createSoundEffect(WaveShape.Sine, 4699, 1133, 255, 0, 500, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    shielded = 0
    godMode = 1
    timer.after(500, function () {
        godMode = 0
    })
    sprites.destroy(otherSprite, effects.spray, 100)
    scene.cameraShake(3, 500)
})
sprites.onCreated(SpriteKind.healthBoost, function (sprite) {
    timer.after(2000, function () {
        sprites.destroy(sprite, effects.disintegrate, 100)
    })
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (characterSetup == -1) {
        if (cursorPos < 2) {
            animation.stopAnimation(animation.AnimationTypes.All, cursor)
            cursor.setPosition(cursor.x + 45, red.y + 30)
            animation.runMovementAnimation(
            cursor,
            animation.animationPresets(animation.bobbing),
            2000,
            true
            )
        }
    }
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.bossKnives, function (sprite, otherSprite) {
    sprite.setVelocity(0, 0)
    otherSprite.setVelocity(0, 0)
    otherSprite.follow(otherSprite, 0)
    combo += 1
    if (spaceship.x > 80) {
        info.changeScoreBy(scoreMulti + combo)
    } else {
        info.changeScoreBy(scoreMulti + combo)
    }
    animation.runImageAnimation(
    sprite,
    assets.animation`bulletExplosion`,
    100,
    false
    )
    pause(200)
    if (Math.percentChance(Math.constrain(1 + combo / 10, 1, 25))) {
        boost_health = sprites.create(assets.image`heartBoost`, SpriteKind.healthBoost)
        boost_health.setPosition(randint(20, 140), randint(25, 95))
        boost_health.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
        boost_health.setBounceOnWall(true)
        animation.runImageAnimation(
        boost_health,
        assets.animation`heartBoostIdle`,
        150,
        true
        )
    }
    if (Math.percentChance(Math.constrain(1 + combo / 10, 1, 35))) {
        boost_shield = sprites.create(assets.image`shieldBoost`, SpriteKind.shieldBoost)
        boost_shield.setPosition(randint(20, 140), randint(25, 95))
        boost_shield.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
        boost_shield.setBounceOnWall(true)
        animation.runImageAnimation(
        boost_shield,
        assets.animation`shieldBoostIdle`,
        100,
        true
        )
    }
    music.play(music.melodyPlayable(music.zapped), music.PlaybackMode.InBackground)
    scene.cameraShake(4, 100)
    pause(200)
    sprites.destroy(sprite)
    sprites.destroy(otherSprite, effects.spray, 100)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.bulletSizeBoost, function (sprite, otherSprite) {
    music.play(music.melodyPlayable(music.beamUp), music.PlaybackMode.InBackground)
    bulletSize = Math.constrain(bulletSize + bulletSize * 5 / 100, 1, 5)
    sprites.destroy(otherSprite)
})
sprites.onCreated(SpriteKind.attackSpeedBoost, function (sprite) {
    timer.after(2000, function () {
        sprites.destroy(sprite, effects.disintegrate, 100)
    })
})
sprites.onOverlap(SpriteKind.playerShield, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.setVelocity(0, 0)
    sprites.destroy(sprite, effects.bubbles, 100)
    music.play(music.createSoundEffect(WaveShape.Sine, 4699, 1133, 255, 0, 500, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    shielded = 0
    godMode = 1
    timer.after(500, function () {
        godMode = 0
    })
    sprites.destroy(otherSprite, effects.spray, 100)
    scene.cameraShake(3, 500)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.bossBullet, function (sprite, otherSprite) {
    combo = 0
    controller.moveSprite(spaceship, 0, 0)
    timer.after(250, function () {
        controller.moveSprite(spaceship, playerSpeed, playerSpeed)
    })
    otherSprite.setVelocity(0, 0)
    if (info.life() >= 2) {
        music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)
    } else {
        music.play(music.melodyPlayable(music.sonar), music.PlaybackMode.InBackground)
    }
    scene.cameraShake(8, 500)
    info.changeLifeBy(-1)
    info.changeScoreBy(Math.abs(scoreMulti - combo) * -3)
    sprites.destroy(otherSprite, effects.spray, 100)
})
info.onLifeZero(function () {
    info.stopCountdown()
    animation.stopAnimation(animation.AnimationTypes.All, spaceship)
    controller.moveSprite(spaceship, 0, 0)
    spaceship.startEffect(effects.fire, 5000)
    spaceship.startEffect(effects.ashes, 5000)
    spaceship.setStayInScreen(false)
    spaceship.setVelocity(25, 25)
    sprites.destroy(spaceship, effects.spray, 9999)
    gameOver = 1
})
controller.A.onEvent(ControllerButtonEvent.Repeated, function () {
    if (startGame == -1) {
        if (pauseAttack == 0) {
            if (gameOver == 0) {
                music.play(music.melodyPlayable(music.pewPew), music.PlaybackMode.InBackground)
                bullet = sprites.createProjectileFromSprite(assets.image`bullet`, spaceship, bulletSpeed * -1, 0)
                bullet.setScale(bulletSize, ScaleAnchor.Middle)
                pauseAttack = 1
                bulletList.push(bullet)
                timer.after(attackRate, function () {
                    pauseAttack = 0
                })
            }
        }
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.bossBanana, function (sprite, otherSprite) {
    combo = 0
    controller.moveSprite(spaceship, 0, 0)
    timer.after(250, function () {
        controller.moveSprite(spaceship, playerSpeed, playerSpeed)
    })
    otherSprite.setVelocity(0, 0)
    if (info.life() >= 2) {
        music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)
    } else {
        music.play(music.melodyPlayable(music.sonar), music.PlaybackMode.InBackground)
    }
    scene.cameraShake(8, 500)
    info.changeLifeBy(-1)
    info.changeScoreBy(Math.abs(scoreMulti - combo) * -3)
    sprites.destroy(otherSprite, effects.spray, 100)
})
sprites.onOverlap(SpriteKind.playerShield, SpriteKind.bossBanana, function (sprite, otherSprite) {
    otherSprite.setVelocity(0, 0)
    sprites.destroy(sprite, effects.bubbles, 100)
    music.play(music.createSoundEffect(WaveShape.Sine, 4699, 1133, 255, 0, 500, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    shielded = 0
    godMode = 1
    timer.after(500, function () {
        godMode = 0
    })
    sprites.destroy(otherSprite, effects.spray, 100)
    scene.cameraShake(3, 500)
})
sprites.onCreated(SpriteKind.bulletSizeBoost, function (sprite) {
    timer.after(2000, function () {
        sprites.destroy(sprite, effects.disintegrate, 100)
    })
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprite.setVelocity(0, 0)
    otherSprite.setVelocity(0, 0)
    combo += 1
    if (spaceship.x > 80) {
        info.changeScoreBy(scoreMulti + combo)
    } else {
        info.changeScoreBy(scoreMulti + combo)
    }
    if (boss == 0) {
        if (Math.percentChance(25 + bossesKilled * 5)) {
            if (info.countdown() + (scoreMulti + combo) / 10 <= 599) {
                info.changeCountdownBy((scoreMulti + combo) / 10)
            }
        }
    }
    animation.runImageAnimation(
    sprite,
    assets.animation`bulletExplosion`,
    100,
    false
    )
    pause(200)
    if (Math.percentChance(Math.constrain(1 + combo, 1, 50))) {
        boost_attackSpeed = sprites.create(assets.image`attackSpeedBoost`, SpriteKind.attackSpeedBoost)
        boost_attackSpeed.setPosition(randint(20, 140), randint(25, 95))
        boost_attackSpeed.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
        boost_attackSpeed.setBounceOnWall(true)
        animation.runImageAnimation(
        boost_attackSpeed,
        assets.animation`attackSpeedBoostAnim`,
        100,
        true
        )
    }
    if (Math.percentChance(Math.constrain(1 + combo, 1, 50))) {
        boost_movSpeed = sprites.create(assets.image`movementSpeedBoost`, SpriteKind.movSpeedBoost)
        boost_movSpeed.setPosition(randint(20, 140), randint(25, 95))
        boost_movSpeed.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
        boost_movSpeed.setBounceOnWall(true)
        animation.runImageAnimation(
        boost_movSpeed,
        assets.animation`movementSpeedBoostAnim`,
        100,
        true
        )
    }
    if (Math.percentChance(Math.constrain(1 + combo, 1, 50))) {
        boost_bulletSize = sprites.create(assets.image`bulletSizeBoost`, SpriteKind.bulletSizeBoost)
        boost_bulletSize.setPosition(randint(20, 140), randint(25, 95))
        boost_bulletSize.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
        boost_bulletSize.setBounceOnWall(true)
        animation.runImageAnimation(
        boost_bulletSize,
        assets.animation`bulletSizeBoostAnim`,
        100,
        true
        )
    }
    if (Math.percentChance(Math.constrain(1 + combo / 10, 1, 25))) {
        boost_health = sprites.create(assets.image`heartBoost`, SpriteKind.healthBoost)
        boost_health.setPosition(randint(20, 140), randint(25, 95))
        boost_health.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
        boost_health.setBounceOnWall(true)
        animation.runImageAnimation(
        boost_health,
        assets.animation`heartBoostIdle`,
        150,
        true
        )
    }
    if (Math.percentChance(Math.constrain(1 + combo / 10, 1, 35))) {
        boost_shield = sprites.create(assets.image`shieldBoost`, SpriteKind.shieldBoost)
        boost_shield.setPosition(randint(20, 140), randint(25, 95))
        boost_shield.setVelocity((15 + difficultySpeed) * Math.round(randint(-1, 1)), (15 + difficultySpeed) * Math.round(randint(-1, 1)))
        boost_shield.setBounceOnWall(true)
        animation.runImageAnimation(
        boost_shield,
        assets.animation`shieldBoostIdle`,
        100,
        true
        )
    }
    music.play(music.melodyPlayable(music.thump), music.PlaybackMode.InBackground)
    scene.cameraShake(4, 100)
    pause(200)
    sprites.destroy(sprite)
    sprites.destroy(otherSprite, effects.spray, 100)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    controller.moveSprite(spaceship, 0, 0)
    timer.after(250, function () {
        controller.moveSprite(spaceship, playerSpeed, playerSpeed)
    })
    otherSprite.setVelocity(0, 0)
    if (info.life() >= 2) {
        music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)
    } else {
        music.play(music.melodyPlayable(music.sonar), music.PlaybackMode.InBackground)
    }
    scene.cameraShake(8, 500)
    info.changeLifeBy(-1)
    info.changeScoreBy(Math.abs(scoreMulti - combo) * -3)
    sprites.destroy(otherSprite, effects.spray, 100)
    combo = 0
})
let bossBullet2: Sprite = null
let rock: Sprite = null
let statsIcons: Sprite = null
let blue: Sprite = null
let green: Sprite = null
let movementSpeedSprite: Sprite = null
let attackSpeedSprite: Sprite = null
let healthValueSprite: Sprite = null
let bossBanana2: Sprite = null
let bananaRain = 0
let rockList: Sprite[] = []
let deathRay: Sprite = null
let activeBeam = 0
let highScore = 0
let bossSprite: Sprite = null
let playerHealth = 0
let red: Sprite = null
let cursor: Sprite = null
let cursorPos = 0
let difficultySpeed = 0
let boost_shield: Sprite = null
let boost_health: Sprite = null
let boost_bulletSize: Sprite = null
let boost_movSpeed: Sprite = null
let boost_attackSpeed: Sprite = null
let bossType = 0
let bossHPBarLabel: StatusBarSprite = null
let bossesKilled = 0
let bossHPBar: StatusBarSprite = null
let bullet: Sprite = null
let gameOver = 0
let music2 = 0
let characterSetup = 0
let timer2 = 0
let finalBoss = 0
let boss = 0
let pausedText: TextSprite = null
let paused = 0
let startGame = 0
let godMode = 0
let comboSprite: TextSprite = null
let spaceship: Sprite = null
let playerShield: Sprite = null
let shielded = 0
let bulletList: Sprite[] = []
let bulletSize = 0
let combo = 0
let spawnRocks = 0
let playerSpeed = 0
let pauseAttack = 0
let attackRate = 0
let scoreMulti = 0
let bulletSpeed = 0
let mainMenu = 0
if (!(blockSettings.exists("High Score"))) {
    blockSettings.writeNumber("High Score", 0)
}
let originalTimer = 0
color.startFade(color.Black, color.originalPalette, 1000)
let menuBg = sprites.create(assets.image`spaceBg`, SpriteKind.UI)
menuBg.setScale(1.2, ScaleAnchor.Middle)
let titleText = textsprite.create("Space Ninja", 1, 15)
titleText.setMaxFontHeight(16)
titleText.setPosition(80, 30)
let startText = textsprite.create("Start", 1, 15)
startText.setPosition(80, 85)
animation.runMovementAnimation(
startText,
animation.animationPresets(animation.bobbing),
2000,
true
)
music.setVolume(255)
music.play(music.stringPlayable("G F G A - F E D ", 120), music.PlaybackMode.LoopingInBackground)
mainMenu = 1
let spawnRate = 5000
bulletSpeed = 200
scoreMulti = 10
attackRate = 1000
pauseAttack = 0
playerSpeed = 100
let bossReq = 500
let bossSpeed = 15
let bossHealth = 3
spawnRocks = 1
combo = 0
bulletSize = 1
let finalBossReq = 1000000
bulletList = []
let bossKnives: Sprite[] = []
game.onUpdate(function () {
    if (activeBeam == -1) {
        deathRay.setPosition(bossSprite.x + 85, bossSprite.y - 8)
    }
})
game.onUpdate(function () {
    if (activeBeam == 1) {
        deathRay = sprites.create(assets.image`deathRay`, SpriteKind.bossLaser)
        activeBeam = -1
        deathRay.follow(spaceship, 300)
        animation.runImageAnimation(
        deathRay,
        assets.animation`deathRayAnim`,
        randint(1, 100),
        false
        )
        timer.after(5000, function () {
            activeBeam = 0
            sprites.destroy(deathRay)
        })
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        comboSprite.setText(convertToText(combo))
        comboSprite.setPosition(spaceship.x + 5, spaceship.y - 11)
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        for (let index3 = 0; index3 <= bulletList.length - 1; index3++) {
            if (bulletList[index3].x < bulletList[index3].scale * -1) {
                sprites.destroy(bulletList.removeAt(index3))
            }
        }
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        for (let value of rockList) {
            if (value.x > 160 + value.scale / 2) {
                sprites.destroy(value)
            }
        }
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        if (info.score() >= bossReq && boss == 0) {
            timer2 = info.countdown()
            info.stopCountdown()
            bossReq += bossReq * (scoreMulti + bossesKilled) / 5
            boss = 1
            spawnRocks = 0
        }
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        if (bananaRain == 1) {
            for (let index = 0; index < randint(5, 10); index++) {
                timer.background(function () {
                    bossBanana2 = sprites.create(assets.image`bossBanana`, SpriteKind.bossBanana)
                    bossBanana2.setPosition(randint(-10, 80), -10)
                    bossBanana2.setVelocity(randint(15 + difficultySpeed, 30 + difficultySpeed), randint(30 + difficultySpeed, 50 + difficultySpeed))
                    pause(200)
                })
            }
            if (boss != 0) {
                animation.runImageAnimation(
                bossSprite,
                assets.animation`spaceMonkeyIdle`,
                200,
                true
                )
            }
            bananaRain = -1
            timer.after(3000, function () {
                bananaRain = 0
            })
        }
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        if (info.score() >= finalBossReq && finalBoss == 0) {
            finalBoss = 1
            spawnRocks = 0
            timer2 = info.countdown()
            info.stopCountdown()
        }
    }
})
game.onUpdate(function () {
    if (characterSetup == -1) {
        if (cursor.x == red.x) {
            cursorPos = 0
            red.setScale(1.5, ScaleAnchor.Middle)
            healthValueSprite.setImage(assets.image`threeSprite`)
            attackSpeedSprite.setImage(assets.image`oneSprite`)
            movementSpeedSprite.setImage(assets.image`twoSprite`)
        } else {
            red.setScale(1, ScaleAnchor.Middle)
        }
        if (cursor.x == green.x) {
            cursorPos = 1
            green.setScale(1.5, ScaleAnchor.Middle)
            healthValueSprite.setImage(assets.image`twoSprite`)
            attackSpeedSprite.setImage(assets.image`oneSprite`)
            movementSpeedSprite.setImage(assets.image`threeSprite`)
        } else {
            green.setScale(1, ScaleAnchor.Middle)
        }
        if (cursor.x == blue.x) {
            cursorPos = 2
            blue.setScale(1.5, ScaleAnchor.Middle)
            healthValueSprite.setImage(assets.image`oneSprite`)
            attackSpeedSprite.setImage(assets.image`threeSprite`)
            movementSpeedSprite.setImage(assets.image`twoSprite`)
        } else {
            blue.setScale(1, ScaleAnchor.Middle)
        }
    }
})
game.onUpdate(function () {
    if (paused == 1) {
        if (finalBoss == 0 && boss == 0) {
            timer2 = info.countdown()
            info.stopCountdown()
        }
        pauseUntil(() => paused == 0)
    }
})
game.onUpdate(function () {
    if (finalBoss == 1) {
        bossSprite = sprites.create(assets.image`amogus`, SpriteKind.finalBoss)
        music2 = 0
        music.stopAllSounds()
        music.play(music.stringPlayable("E B C5 A B G A F ", 50), music.PlaybackMode.LoopingInBackground)
        timer.after(3000, function () {
            music.stopAllSounds()
            music.play(music.stringPlayable("E B C5 A B G A F ", 500), music.PlaybackMode.LoopingInBackground)
        })
        bossSprite.setScale(3, ScaleAnchor.Middle)
        bossSprite.setPosition(-30, 60)
        bossHPBar = statusbars.create(80, 10, StatusBarKind.Health)
        bossHPBar.setPosition(80, -15)
        bossHPBar.setColor(1, 15, 12)
        bossHPBar.max = bossHealth * 10
        bossHPBar.value = bossHealth * 10
        bossHPBar.setBarBorder(1, 3)
        bossHPBar.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)
        scene.cameraShake(8, 3000)
        bossSprite.setVelocity(30, 0)
        bossHPBar.setVelocity(0, 15)
        finalBoss = -1
    } else {
        if (boss == 1) {
            music2 = 0
            music.stopAllSounds()
            music.play(music.stringPlayable("E B C5 A B G A F ", 200), music.PlaybackMode.LoopingInBackground)
            if (Math.percentChance(Math.constrain(5 + bossesKilled * 5, 5, 50))) {
                bossType = 0
                bossSprite = sprites.create(assets.image`spaceMonkey`, SpriteKind.Boss)
                animation.runImageAnimation(
                bossSprite,
                assets.animation`spaceMonkeyIdle`,
                200,
                true
                )
            } else {
                bossType = 1
                bossSprite = sprites.create(assets.image`spaceDuck`, SpriteKind.Boss)
                animation.runImageAnimation(
                bossSprite,
                assets.animation`spaceDuckIdle`,
                150,
                true
                )
            }
            bossSprite.setScale(2, ScaleAnchor.Middle)
            bossSprite.setPosition(-30, randint(20, 100))
            bossHPBar = statusbars.create(80, 10, StatusBarKind.Health)
            bossHPBar.setPosition(80, -15)
            bossHPBar.setColor(1, 15, 12)
            if (bossType == 0) {
                bossHPBar.max = bossHealth * 2
                bossHPBar.value = bossHealth * 2
            } else if (bossType == 1) {
                bossHPBar.max = bossHealth
                bossHPBar.value = bossHealth
            }
            bossHPBar.setBarBorder(1, 3)
            bossHPBar.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)
            scene.cameraShake(8, 3000)
            bossSprite.setVelocity(30, 0)
            bossHPBar.setVelocity(0, 15)
            boss = -1
        }
    }
})
game.onUpdate(function () {
    if (startGame == 1) {
        spaceship = sprites.create(assets.image`redPlane`, SpriteKind.Player)
        spaceship.setPosition(145, 60)
        if (cursorPos == 1) {
            spaceship.setImage(assets.image`greenPlane`)
            animation.runImageAnimation(
            spaceship,
            assets.animation`greenPlaneIdle`,
            200,
            true
            )
            playerHealth = 2
            attackRate = 750
            playerSpeed = 200
        } else if (cursorPos == 2) {
            spaceship.setImage(assets.image`bluePlane`)
            animation.runImageAnimation(
            spaceship,
            assets.animation`bluePlaneIdle`,
            200,
            true
            )
            playerHealth = 1
            attackRate = 500
            playerSpeed = 125
        } else {
            animation.runImageAnimation(
            spaceship,
            assets.animation`redPlaneIdle`,
            200,
            true
            )
            playerHealth = 3
            attackRate = 1000
            playerSpeed = 100
        }
        color.startFadeFromCurrent(color.originalPalette, 500)
        startGame = -1
        controller.moveSprite(spaceship)
        spaceship.setStayInScreen(true)
        info.startCountdown(60)
        info.setLife(playerHealth)
        info.setScore(0)
        comboSprite = textsprite.create(convertToText(combo), 0, 3)
        comboSprite.setOutline(1, 1)
        animation.runMovementAnimation(
        comboSprite,
        animation.animationPresets(animation.bobbing),
        1000,
        true
        )
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        if (info.score() > highScore) {
            highScore = info.score()
        }
        if (highScore > blockSettings.readNumber("High Score")) {
            blockSettings.writeNumber("High Score", highScore)
        }
    }
})
game.onUpdate(function () {
    if (finalBoss == -1) {
        if (bossSprite.x >= 15) {
            bossSprite.setVelocity(0, 0)
            bossSprite.setStayInScreen(true)
            finalBoss = -2
        }
    } else {
        if (boss == -1) {
            if (bossSprite.x >= 15) {
                bossSprite.setVelocity(0, 0)
                bossSprite.setStayInScreen(true)
                boss = -2
            }
        }
    }
})
game.onUpdate(function () {
    if (gameOver == 1) {
        if (spaceship.y > 130 || spaceship.x > 180) {
            music2 = 0
            music.stopAllSounds()
            info.setScore(highScore)
            game.setGameOverMessage(false, "Highest Score:" + convertToText(blockSettings.readNumber("High Score")))
            game.gameOver(false)
        }
    }
})
game.onUpdate(function () {
    if (characterSetup == 1) {
        scroller.setLayerImage(scroller.BackgroundLayer.Layer0, assets.image`gameBgB`)
        scroller.setLayerImage(scroller.BackgroundLayer.Layer4, assets.image`gameBgA`)
        scroller.scrollBackgroundWithSpeed(25, 0, scroller.BackgroundLayer.Layer0)
        scroller.scrollBackgroundWithSpeed(50, 0, scroller.BackgroundLayer.Layer4)
        statsIcons = sprites.create(assets.image`statsIcons`, SpriteKind.UI)
        red = sprites.create(assets.image`redPlane`, SpriteKind.UI)
        red.setPosition(35, 60)
        green = sprites.create(assets.image`greenPlane`, SpriteKind.UI)
        green.setPosition(80, 60)
        blue = sprites.create(assets.image`bluePlane`, SpriteKind.UI)
        blue.setPosition(125, 60)
        cursor = sprites.create(assets.image`cursor`, SpriteKind.UI)
        cursor.setPosition(red.x, red.y + 30)
        healthValueSprite = sprites.create(assets.image`threeSprite`, SpriteKind.UI)
        healthValueSprite.setPosition(35, 10)
        attackSpeedSprite = sprites.create(assets.image`oneSprite`, SpriteKind.UI)
        attackSpeedSprite.setPosition(92, 10)
        movementSpeedSprite = sprites.create(assets.image`twoSprite`, SpriteKind.UI)
        movementSpeedSprite.setPosition(147, 10)
        cursorPos = 0
        animation.runMovementAnimation(
        cursor,
        animation.animationPresets(animation.bobbing),
        2000,
        true
        )
        music.play(music.stringPlayable("C5 G B A F A C5 B ", 280), music.PlaybackMode.LoopingInBackground)
        color.startFadeFromCurrent(color.originalPalette, 500)
        characterSetup = -1
    }
})
game.onUpdate(function () {
    if (boss == -3 || finalBoss == -3) {
        if (spawnRocks == 1) {
            boss = 0
            sprites.destroyAllSpritesOfKind(SpriteKind.bossBanana, effects.spray, 100)
            sprites.destroyAllSpritesOfKind(SpriteKind.bossBullet, effects.spray, 100)
        } else {
            bossSprite.setVelocity(0, bossSpeed * -1)
            if (boss == -3) {
                timer.after(5000, function () {
                    boss = -2
                })
            } else if (finalBoss == -3) {
                timer.after(5000, function () {
                    finalBoss = -2
                })
            }
        }
    }
})
game.onUpdate(function () {
    if (boss == -1 || finalBoss == -1) {
        if (bossHPBar.y >= 5) {
            bossHPBar.setVelocity(0, 0)
            bossHPBar.setPosition(80, 5)
            bossHPBar.setStayInScreen(true)
            bossHPBarLabel = statusbars.create(0, 0, StatusBarKind.Label)
            if (finalBoss != 0) {
                bossHPBarLabel.setLabel("A M O G U S", 3)
            } else {
                if (bossType == 0) {
                    bossHPBarLabel.setLabel("Space Monkey", 3)
                } else if (bossType == 1) {
                    bossHPBarLabel.setLabel("Space Duck", 3)
                }
            }
            bossHPBarLabel.setPosition(80, 5)
        }
    }
})
game.onUpdate(function () {
    if (music2 == 1) {
        music.stopAllSounds()
        music2 = -1
    }
})
game.onUpdate(function () {
    if (music2 == -1) {
        if (boss == 0 && finalBoss == 0) {
            music2 = 0
            timer.background(function () {
                music.play(music.stringPlayable("E D E F E A B C5 ", 120), music.PlaybackMode.UntilDone)
                music2 = -2
            })
        }
    }
})
game.onUpdate(function () {
    if (music2 == -2) {
        if (boss == 0 && finalBoss == 0) {
            music2 = 0
            timer.background(function () {
                music.play(music.stringPlayable("E D E F E A B A ", 120), music.PlaybackMode.UntilDone)
                music2 = -3
            })
        }
    }
})
game.onUpdate(function () {
    if (music2 == -3) {
        if (boss == 0 && finalBoss == 0) {
            music2 = 0
            timer.background(function () {
                music.play(music.stringPlayable("E D E F E A B C5 ", 120), music.PlaybackMode.UntilDone)
                music2 = -4
            })
        }
    }
})
game.onUpdate(function () {
    if (boss == -2 || finalBoss == -2) {
        if (spawnRocks == 1) {
            boss = 0
            sprites.destroyAllSpritesOfKind(SpriteKind.bossBanana, effects.spray, 100)
            sprites.destroyAllSpritesOfKind(SpriteKind.bossBullet, effects.spray, 100)
        } else {
            bossSprite.setVelocity(0, bossSpeed)
            if (boss == -2) {
                timer.after(5000, function () {
                    boss = -3
                })
            } else if (finalBoss == -2) {
                timer.after(5000, function () {
                    finalBoss = -3
                })
            }
        }
    }
})
game.onUpdate(function () {
    if (music2 == -4) {
        if (boss == 0) {
            music2 = 0
            timer.background(function () {
                music.play(music.stringPlayable("E D E F E A G A ", 120), music.PlaybackMode.UntilDone)
                music2 = -1
            })
        }
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        if (shielded == 1) {
            playerShield.setPosition(spaceship.x - 1, spaceship.y)
        }
    }
})
game.onUpdate(function () {
    if (startGame == -1) {
        if (godMode == 1) {
            godMode = -1
            spaceship.setKind(SpriteKind.godMode)
        } else if (godMode == 0) {
            godMode = -1
            spaceship.setKind(SpriteKind.Player)
        }
    }
})
game.onUpdateInterval(5000, function () {
    if (startGame == -1) {
        scoreMulti += 10
        difficultySpeed += 0.5
        spawnRate = Math.constrain(spawnRate - 100, 500, 5000)
        bossHealth += 1
    }
})
forever(function () {
    if (paused == 0) {
        if (startGame == -1 && spawnRocks == 1) {
            for (let index = 0; index < randint(1, 5); index++) {
                rock = sprites.create(assets.image`rock`, SpriteKind.Enemy)
                if (Math.percentChance(25)) {
                    rock.setImage(assets.image`rock1`)
                } else if (Math.percentChance(25)) {
                    rock.setImage(assets.image`rock2`)
                } else if (Math.percentChance(25)) {
                    rock.setImage(assets.image`rock3`)
                }
                rock.setVelocity(randint(50 + difficultySpeed, 100 + difficultySpeed), 0)
                rock.setPosition(-5, randint(10, 110))
                rockList.push(rock)
            }
            pause(spawnRate)
        }
    }
})
forever(function () {
    if (startGame == -1) {
        if (finalBoss != 0 && finalBoss != -1) {
            if (Math.percentChance(25) || bossHPBar.value <= bossHealth * 5) {
                if (activeBeam == 0) {
                    activeBeam = 1
                }
            } else {
                bossBullet2 = sprites.create(assets.image`knife`, SpriteKind.bossKnives)
                bossBullet2.setPosition(bossSprite.x + 15, bossSprite.y - 8)
                bossBullet2.follow(spaceship, randint(Math.abs(50 + difficultySpeed - combo), Math.abs(100 + difficultySpeed - combo)))
                bossKnives.push(bossBullet2)
                timer.after(3000, function () {
                    sprites.destroy(bossKnives.shift(), effects.fire, 100)
                })
            }
            pause(randint(1000, 3000))
        } else {
            if (boss != 0 && boss != -1) {
                if (bossType == 0) {
                    if (Math.percentChance(25)) {
                        for (let index = 0; index < randint(5, 10); index++) {
                            timer.background(function () {
                                bossBanana2 = sprites.create(assets.image`bossBanana`, SpriteKind.bossBullet)
                                bossBanana2.setPosition(bossSprite.x, bossSprite.y)
                                bossBanana2.setVelocity(randint(50 + difficultySpeed, 100 + difficultySpeed), randint((50 + difficultySpeed) * Math.round(randint(-1, 1)), (100 + difficultySpeed) * Math.round(randint(-1, 1))))
                                pause(100)
                            })
                        }
                        timer.after(2000, function () {
                            bossBanana2.setBounceOnWall(false)
                            timer.after(1000, function () {
                                sprites.destroyAllSpritesOfKind(SpriteKind.bossBullet, effects.spray, 100)
                            })
                        })
                    } else if (Math.percentChance(25)) {
                        for (let index = 0; index < 3; index++) {
                            bossBanana2 = sprites.create(assets.image`greenBossBanana`, SpriteKind.bossBullet)
                            bossBanana2.setPosition(bossSprite.x, bossSprite.y)
                            bossBanana2.follow(spaceship, randint(50 + difficultySpeed, 100 + difficultySpeed))
                            timer.after(1500, function () {
                                sprites.destroy(bossBanana2, effects.spray, 100)
                            })
                        }
                    } else {
                        if (bananaRain == 0) {
                            animation.stopAnimation(animation.AnimationTypes.All, bossSprite)
                            animation.runImageAnimation(
                            bossSprite,
                            assets.animation`monkeyThrowAnim`,
                            200,
                            false
                            )
                            bananaRain = 1
                        }
                    }
                    pause(randint(3000, 5000))
                } else {
                    if (Math.percentChance(25)) {
                        bossBullet2 = sprites.create(assets.image`duckHomingBullet`, SpriteKind.bossBullet)
                        bossBullet2.setPosition(bossSprite.x, bossSprite.y)
                        bossBullet2.follow(spaceship, randint(25 + difficultySpeed, 50 + difficultySpeed))
                        timer.after(1000, function () {
                            sprites.destroy(bossBullet2, effects.spray, 100)
                        })
                    } else {
                        for (let index = 0; index < randint(3, 5); index++) {
                            timer.background(function () {
                                bossBullet2 = sprites.create(assets.image`duckBullet`, SpriteKind.bossBullet)
                                bossBullet2.setPosition(bossSprite.x, bossSprite.y)
                                bossBullet2.setVelocity(randint(25 + difficultySpeed, 50 + difficultySpeed), randint((25 + difficultySpeed) * Math.round(randint(-1, 1)), (50 + difficultySpeed) * Math.round(randint(-1, 1))))
                                bossBullet2.setBounceOnWall(true)
                                pause(100)
                            })
                        }
                        timer.after(2000, function () {
                            bossBullet2.setBounceOnWall(false)
                            timer.after(1000, function () {
                                sprites.destroyAllSpritesOfKind(SpriteKind.bossBullet, effects.spray, 100)
                            })
                        })
                        pause(randint(2500, 4000))
                    }
                }
            }
        }
    }
})
