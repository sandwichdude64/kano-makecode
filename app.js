// Setup the Blockly Python Generator tool
const Python = Blockly.Python;

// 1. Define the Visual Blocks
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

// 2. Define the Python Code Generators for the blocks
Python['wand_on_button'] = function(block) {
  const statements_do = Python.statementToCode(block, 'DO');
  return `def on_button(self, pressed):\n  if pressed:\n${statements_do || '    pass\n'}`;
};

Python['wand_set_led'] = function(block) {
  const dropdown_color = block.getFieldValue('COLOR');
  const colorMap = { 'RED': '#FF0000', 'BLUE': '#0000FF', 'GREEN': '#00FF00', 'GOLD': '#FFD700' };
  return `    self.set_led_async("${colorMap[dropdown_color]}")\n`;
};

// 3. Inject the Workspace layout into the page
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  grid: {spacing: 20, length: 3, colour: '#444', snap: true},
  trashcan: true,
  // ADD THIS LINE BELOW:
  media: 'https://unpkg.com' 
});


// 4. Update the live terminal output whenever blocks move
workspace.addChangeListener(() => {
  try {
    const pythonCode = Python.workspaceToCode(workspace);
    const outputWindow = document.getElementById('outputCode');
    outputWindow.value = pythonCode.trim() === "" 
      ? "# Drag and drop blocks here to see Python compilation..." 
      : pythonCode;
  } catch (error) {
    console.error("Compilation error:", error);
  }
});

