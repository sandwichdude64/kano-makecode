document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Define Visual Custom Block Shapes
  Blockly.Blocks['wand_on_button'] = {
    init: function() {
      this.appendDummyInput().appendField("When wand button is pressed");
      this.appendStatementInput("DO").setCheck(null).appendField("do");
      this.setColour(230);
    }
  };

  Blockly.Blocks['wand_set_led'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set wand light to")
          .appendField(new Blockly.FieldDropdown([["Red","RED"], ["Blue","BLUE"], ["Green","GREEN"], ["Gold","GOLD"]]), "COLOR");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
    }
  };

  // 2. Map Block Rules straight to Python strings
  Blockly.Python['wand_on_button'] = function(block) {
    const statements_do = Blockly.Python.statementToCode(block, 'DO');
    return `def on_button(self, pressed):\n  if pressed:\n${statements_do || '    pass\n'}`;
  };

  Blockly.Python['wand_set_led'] = function(block) {
    const dropdown_color = block.getFieldValue('COLOR');
    const colorMap = { 'RED': '#FF0000', 'BLUE': '#0000FF', 'GREEN': '#00FF00', 'GOLD': '#FFD700' };
    return `    self.set_led_async("${colorMap[dropdown_color]}")\n`;
  };

  // 3. Inject the clean Workspace layout canvas
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    grid: {spacing: 20, length: 3, colour: '#444', snap: true},
    trashcan: true,
    media: 'https://unpkg.com'
  });

  // 4. Update the live preview panel automatically
  workspace.addChangeListener(() => {
    try {
      const pythonCode = Blockly.Python.workspaceToCode(workspace);
      const outputWindow = document.getElementById('outputCode');
      outputWindow.value = pythonCode.trim() === "" 
        ? "# Drag and drop blocks here to see Python compilation..." 
        : pythonCode;
    } catch (error) {
      console.error("Compilation error:", error);
    }
  });

  // 5. Build the network trigger out to the local Pi Server
  document.getElementById('runBtn').addEventListener('click', () => {
    // Put your Raspberry Pi's local network IP here
    const PI_IP_ADDRESS = "192.168.1.100"; 
    
    const generatedCode = Blockly.Python.workspaceToCode(workspace);
    if (!generatedCode) {
      alert("Drag some blocks onto the canvas first!");
      return;
    }

    fetch(`http://${PI_IP_ADDRESS}:5000/run-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: generatedCode })
    })
    .then(res => res.json())
    .then(data => {
      if(data.status === "success") {
        alert("✨ Magic compiled! Click your wand button to run.");
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch(err => {
      alert("Could not talk to the Pi! Make sure server.py is running on the Pi and your IP is correct.");
      console.error(err);
    });
  });
});
