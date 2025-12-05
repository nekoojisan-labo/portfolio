// ==========================================
// 新宿3Dマップシステム (Three.js)
// ==========================================

class Shinjuku3DMap {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.buildings = [];
        this.streetlights = [];
        this.characters = [];

        console.log('[3D Map] Initializing Shinjuku map...');
        this.createMap();
    }

    // ==========================================
    // マップ生成
    // ==========================================
    createMap() {
        this.createGround();
        this.createBuildings();
        this.createStreetlights();
        this.createCharacters();
        this.createEnvironment();

        console.log('[3D Map] ✓ Shinjuku map created!');
    }

    // ==========================================
    // 地面作成
    // ==========================================
    createGround() {
        // メインストリート
        const groundGeometry = new THREE.PlaneGeometry(100, 80);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0c,  // ダークグレー（アスファルト）
            roughness: 0.9,
            metalness: 0.1
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;  // 水平に配置
        ground.position.set(50, 0, 40);
        ground.receiveShadow = true;
        ground.name = 'Ground';

        this.scene.add(ground);

        // 水たまり（反射する）
        this.createPuddles();
    }

    createPuddles() {
        const puddleGeometry = new THREE.CircleGeometry(2, 32);
        const puddles = [
            { x: 20, z: 25, scale: 1.5 },
            { x: 45, z: 35, scale: 1.2 },
            { x: 70, z: 20, scale: 1.8 },
            { x: 30, z: 55, scale: 1.3 },
            { x: 65, z: 50, scale: 1.6 },
            { x: 80, z: 60, scale: 1.4 }
        ];

        puddles.forEach((p, i) => {
            const puddleMaterial = new THREE.MeshStandardMaterial({
                color: 0x0f1520,
                roughness: 0.1,
                metalness: 0.95,
                transparent: true,
                opacity: 0.7
            });

            const puddle = new THREE.Mesh(puddleGeometry, puddleMaterial);
            puddle.rotation.x = -Math.PI / 2;
            puddle.position.set(p.x, 0.01, p.z);
            puddle.scale.set(p.scale, p.scale, 1);
            puddle.name = `Puddle_${i}`;

            this.scene.add(puddle);
        });
    }

    // ==========================================
    // ビル群作成
    // ==========================================
    createBuildings() {
        const buildingData = [
            { name: 'WestOffice', x: 15, z: 15, width: 16, depth: 12, height: 45 },
            { name: 'EastCommercial', x: 85, z: 15, width: 14, depth: 14, height: 40 },
            { name: 'WestResidential', x: 15, z: 65, width: 20, depth: 14, height: 30 },
            { name: 'EastResidential', x: 85, z: 65, width: 17, depth: 14, height: 35 },
            { name: 'CenterBlock', x: 50, z: 40, width: 16, depth: 16, height: 38 }
        ];

        buildingData.forEach(data => {
            this.createBuilding(data);
        });
    }

    createBuilding(data) {
        const geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1e2228,  // ダークブルーグレー
            roughness: 0.7,
            metalness: 0.3
        });

        const building = new THREE.Mesh(geometry, material);
        building.position.set(data.x, data.height / 2, data.z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.name = `Building_${data.name}`;

        this.scene.add(building);
        this.buildings.push(building);

        // 簡易的な窓（エミッシブキューブ）
        this.addWindows(building, data);
    }

    addWindows(building, data) {
        const windowGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.1);
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a4a5a,
            emissive: 0x1a2a3a,
            emissiveIntensity: 0.3
        });

        // 簡易版：ランダムに窓を配置
        const windowsPerFloor = 3;
        const floors = Math.floor(data.height / 3);

        for (let floor = 0; floor < floors; floor++) {
            for (let i = 0; i < windowsPerFloor; i++) {
                const window = new THREE.Mesh(windowGeometry, windowMaterial);

                // 北側の壁に配置
                const x = building.position.x + (i - 1) * 3;
                const y = building.position.y - data.height/2 + floor * 3 + 2;
                const z = building.position.z + data.depth/2 + 0.05;

                window.position.set(x, y, z);
                window.name = `Window_${data.name}_${floor}_${i}`;

                this.scene.add(window);
            }
        }
    }

    // ==========================================
    // 街灯作成
    // ==========================================
    createStreetlights() {
        const positions = [
            { x: 20, z: 40 }, { x: 35, z: 40 }, { x: 50, z: 40 },
            { x: 65, z: 40 }, { x: 80, z: 40 },
            { x: 30, z: 15 }, { x: 70, z: 15 },
            { x: 30, z: 65 }, { x: 70, z: 65 }
        ];

        positions.forEach((pos, i) => {
            this.createStreetlight(pos.x, pos.z, i);
        });
    }

    createStreetlight(x, z, index) {
        // ポール
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3c,
            roughness: 0.3,
            metalness: 0.9
        });

        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(x, 2.5, z);
        pole.castShadow = true;
        pole.name = `Streetlight_Pole_${index}`;

        this.scene.add(pole);

        // ランプヘッド（発光）
        const lampGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const lampMaterial = new THREE.MeshStandardMaterial({
            color: 0xb0d0ff,
            emissive: 0xb0d0ff,
            emissiveIntensity: 2.0,
            roughness: 0.2
        });

        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(x, 5.3, z);
        lamp.name = `Streetlight_Head_${index}`;

        this.scene.add(lamp);

        // ポイントライト
        const light = new THREE.PointLight(0xb0d0ff, 1.5, 15);
        light.position.set(x, 5.0, z);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.name = `Light_Street_${index}`;

        this.scene.add(light);

        this.streetlights.push({ pole, lamp, light });
    }

    // ==========================================
    // キャラクター作成（プレースホルダー）
    // ==========================================
    createCharacters() {
        const characterData = [
            { name: 'Kaito', x: 50, z: 50, color: 0x3070ff },      // 青
            { name: 'Akari', x: 40, z: 30, color: 0xff4060 },      // 赤
            { name: 'Citizen1', x: 30, z: 20, color: 0x606060 },   // グレー
            { name: 'Citizen2', x: 70, z: 25, color: 0x555555 },
            { name: 'Citizen3', x: 45, z: 60, color: 0x6a6a6a }
        ];

        characterData.forEach(data => {
            this.createCharacter(data);
        });
    }

    createCharacter(data) {
        // 体（カプセル）
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.6, 16);
        const material = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.5,
            metalness: 0.2
        });

        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.set(data.x, 0.8, data.z);
        body.castShadow = true;
        body.name = `Character_${data.name}_Body`;

        this.scene.add(body);

        // 頭（球）
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const head = new THREE.Mesh(headGeometry, material);
        head.position.set(data.x, 1.8, data.z);
        head.castShadow = true;
        head.name = `Character_${data.name}_Head`;

        this.scene.add(head);

        this.characters.push({ body, head, data });
    }

    // ==========================================
    // 環境設定
    // ==========================================
    createEnvironment() {
        // フォグ（霧）
        this.scene.fog = new THREE.Fog(0x0a0a1e, 30, 120);

        // アンビエントライト（全体的な明るさ）
        const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
        this.scene.add(ambientLight);

        // ディレクショナルライト（太陽光）
        const sunLight = new THREE.DirectionalLight(0xffa366, 0.4);
        sunLight.position.set(-50, 80, -30);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -60;
        sunLight.shadow.camera.right = 60;
        sunLight.shadow.camera.top = 60;
        sunLight.shadow.camera.bottom = -60;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;

        this.scene.add(sunLight);

        console.log('[3D Map] ✓ Environment configured (fog, lighting)');
    }

    // ==========================================
    // キャラクター位置取得（ゲームロジック用）
    // ==========================================
    getCharacterPosition(name) {
        const char = this.characters.find(c => c.data.name === name);
        return char ? char.body.position : null;
    }

    setCharacterPosition(name, x, z) {
        const char = this.characters.find(c => c.data.name === name);
        if (char) {
            char.body.position.set(x, 0.8, z);
            char.head.position.set(x, 1.8, z);
        }
    }

    // ==========================================
    // アニメーション更新
    // ==========================================
    update(deltaTime) {
        // 街灯の明滅エフェクト（オプション）
        this.streetlights.forEach((sl, i) => {
            const flicker = Math.sin(Date.now() * 0.003 + i) * 0.1 + 0.9;
            sl.lamp.material.emissiveIntensity = 2.0 * flicker;
            sl.light.intensity = 1.5 * flicker;
        });
    }
}

// グローバルにエクスポート
window.Shinjuku3DMap = Shinjuku3DMap;
