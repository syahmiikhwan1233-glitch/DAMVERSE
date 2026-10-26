/**
 * DAMVERSE - Third-Person Orbit/Follow Camera & Kinematic Controller
 * Handles keyboard/mouse/touch navigation, vehicle driving kinematics,
 * and terrain height clamping.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { PlayerState } from '../types/game';
import { sampleElevation } from './terrainHeight';

interface CameraControllerProps {
  player: PlayerState;
  updatePlayerMovement: (deltaPos: [number, number, number], rotY: number, moving: boolean, running: boolean) => void;
  enterOrExitVehicle: () => void;
  mobileInputRef: React.MutableRefObject<{
    moveX: number;
    moveY: number;
    lookX: number;
    lookY: number;
    isSprint: boolean;
    isJump: boolean;
    isAction: boolean;
  }>;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  player,
  updatePlayerMovement,
  enterOrExitVehicle,
  mobileInputRef,
}) => {
  const { camera, gl } = useThree();

  const keysHeld = useRef<Record<string, boolean>>({});
  const cameraYaw = useRef<number>(0);
  const cameraPitch = useRef<number>(0.25);
  const isPointerDown = useRef<boolean>(false);
  const prevPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const code = e.code.toLowerCase();
      keysHeld.current[code] = true;

      if (code === 'keye') {
        if (player.nearVehicle || player.inVehicle) {
          enterOrExitVehicle();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code.toLowerCase();
      keysHeld.current[code] = false;
    };

    const handleBlur = () => {
      keysHeld.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [player.nearVehicle, player.inVehicle, enterOrExitVehicle]);

  // Pointer look events
  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        isPointerDown.current = true;
        prevPointer.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown.current) return;
      const dx = e.clientX - prevPointer.current.x;
      const dy = e.clientY - prevPointer.current.y;
      prevPointer.current = { x: e.clientX, y: e.clientY };

      cameraYaw.current -= dx * 0.005;
      cameraPitch.current = Math.max(0.05, Math.min(1.2, cameraPitch.current + dy * 0.004));
    };

    const onPointerUp = () => {
      isPointerDown.current = false;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl.domElement]);

  // Per-frame physics, player motion, and camera follow
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const keys = keysHeld.current;
    const mInput = mobileInputRef.current;

    // Apply mobile touch look
    if (mInput.lookX !== 0 || mInput.lookY !== 0) {
      cameraYaw.current -= mInput.lookX * 0.035;
      cameraPitch.current = Math.max(0.05, Math.min(1.2, cameraPitch.current + mInput.lookY * 0.03));
      mInput.lookX = 0;
      mInput.lookY = 0;
    }

    if (mInput.isAction) {
      mInput.isAction = false;
      if (player.nearVehicle || player.inVehicle) {
        enterOrExitVehicle();
      }
    }

    // Determine movement direction vector
    let forward = 0;
    let strafe = 0;

    if (keys['keyw'] || keys['arrowup']) forward += 1;
    if (keys['keys'] || keys['arrowdown']) forward -= 1;
    if (keys['keya'] || keys['arrowleft']) strafe -= 1;
    if (keys['keyd'] || keys['arrowright']) strafe += 1;

    // Mobile joystick input
    if (Math.abs(mInput.moveY) > 0.1) forward -= mInput.moveY;
    if (Math.abs(mInput.moveX) > 0.1) strafe += mInput.moveX;

    const isMoving = Math.abs(forward) > 0.05 || Math.abs(strafe) > 0.05;
    const isRunning = (keys['shiftleft'] || keys['shiftright'] || mInput.isSprint) && isMoving;

    if (player.inVehicle) {
      // VEHICLE DRIVING PHYSICS
      let steer = 0;
      let throttle = 0;
      if (keys['keyw'] || keys['arrowup'] || mInput.moveY < -0.1) throttle += 1;
      if (keys['keys'] || keys['arrowdown'] || mInput.moveY > 0.1) throttle -= 0.6;
      if (keys['keya'] || keys['arrowleft'] || mInput.moveX < -0.1) steer += 1;
      if (keys['keyd'] || keys['arrowright'] || mInput.moveX > 0.1) steer -= 1;

      const maxSpeed = 26; // m/s (~95 km/h)
      let vehRotY = player.vehicleRotationY + steer * 1.8 * dt * (throttle !== 0 ? Math.sign(throttle) : 1);
      const targetSpeed = throttle * maxSpeed;
      const vehSpeed = THREE.MathUtils.lerp(player.vehicleSpeed, targetSpeed, dt * 3.5);

      const headingX = Math.sin(vehRotY);
      const headingZ = Math.cos(vehRotY);

      const deltaX = headingX * vehSpeed * dt;
      const deltaZ = headingZ * vehSpeed * dt;

      const targetX = player.vehiclePosition[0] + deltaX;
      const targetZ = player.vehiclePosition[2] + deltaZ;
      const targetElev = sampleElevation(targetX, targetZ);
      const deltaY = targetElev - player.vehiclePosition[1];

      updatePlayerMovement([deltaX, deltaY, deltaZ], vehRotY, Math.abs(vehSpeed) > 0.5, false);

      // Camera follows vehicle
      const camDist = 11.0 + Math.abs(vehSpeed) * 0.15;
      const camTargetX = player.vehiclePosition[0];
      const camTargetY = player.vehiclePosition[1] + 1.8;
      const camTargetZ = player.vehiclePosition[2];

      const cx = camTargetX - Math.sin(cameraYaw.current) * Math.cos(cameraPitch.current) * camDist;
      const cy = camTargetY + Math.sin(cameraPitch.current) * camDist + 1.5;
      const cz = camTargetZ - Math.cos(cameraYaw.current) * Math.cos(cameraPitch.current) * camDist;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, cx, 8, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cy, 8, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cz, 8, dt);
      camera.lookAt(camTargetX, camTargetY, camTargetZ);
    } else {
      // ON-FOOT CHARACTER KINEMATICS
      const moveSpeed = isRunning ? 9.5 : 4.5; // m/s
      let deltaX = 0;
      let deltaZ = 0;
      let targetRotY = player.rotationY;

      if (isMoving) {
        // Move relative to camera yaw
        const inputAngle = Math.atan2(strafe, forward);
        const moveAngle = cameraYaw.current + inputAngle;
        targetRotY = moveAngle;

        deltaX = Math.sin(moveAngle) * moveSpeed * dt;
        deltaZ = Math.cos(moveAngle) * moveSpeed * dt;
      }

      const nextX = player.position[0] + deltaX;
      const nextZ = player.position[2] + deltaZ;
      const nextElev = sampleElevation(nextX, nextZ);
      const deltaY = nextElev - player.position[1];

      updatePlayerMovement([deltaX, deltaY, deltaZ], targetRotY, isMoving, isRunning);

      // Camera follows character
      const camDist = 6.2;
      const camTargetX = player.position[0];
      const camTargetY = player.position[1] + 1.6;
      const camTargetZ = player.position[2];

      const cx = camTargetX - Math.sin(cameraYaw.current) * Math.cos(cameraPitch.current) * camDist;
      const cy = camTargetY + Math.sin(cameraPitch.current) * camDist + 0.8;
      const cz = camTargetZ - Math.cos(cameraYaw.current) * Math.cos(cameraPitch.current) * camDist;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, cx, 10, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cy, 10, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cz, 10, dt);
      camera.lookAt(camTargetX, camTargetY, camTargetZ);
    }
  });

  return null;
};
