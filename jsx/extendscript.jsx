if (typeof($) == 'undefined') {
    $ = {};
}

$._SFXStudio = {
    insertAudioAtPlayhead: function(filePath) {
        try {
            var project = app.project;
            if (!project) return "Error: No project open.";
            
            // 1. Verify Active Sequence
            var sequence = project.activeSequence;
            if (!sequence) return "Error: No active sequence found in Premiere.";
            
            // 2. Import the file into Premiere securely
            var importSuccess = project.importFiles([filePath], 
                                                    true, // suppress UI
                                                    project.getInsertionBin(),
                                                    false); // import as numbered stills

            if (!importSuccess) return "Error: Could not import file.";
            
            // 3. Find the imported project item safely
            var importedItem = null;
            var items = project.rootItem.children;
            for (var i = items.numItems - 1; i >= 0; i--) {
                var item = items[i];
                if (item.type == ProjectItemType.CLIP && item.getMediaPath() === filePath) {
                    importedItem = item;
                    break;
                }
            }
            
            if (!importedItem) return "Error: Item imported but could not be resolved.";

            // 4. Verify Playhead Position
            var time = sequence.getPlayerPosition();
            if (!time) return "Error: Could not determine Premiere playhead position.";
            
            // 5. Track Targeting Implementation
            // Official Adobe ExtendScript API does NOT expose which track is currently "Targeted" by the user.
            // Using QE DOM for this is highly unstable and unsupported.
            // Safest Fallback: Insert onto Audio Track 1 (index 0).
            var audioTrack = sequence.audioTracks[0];
            if(audioTrack) {
                audioTrack.overwriteClip(importedItem, time);
            } else {
                return "Error: Sequence does not have any audio tracks.";
            }

            return "Success";
        } catch (e) {
            return "Error: " + e.toString();
        }
    },
    
    ping: function() {
        return "Pong from Premiere!";
    }
};
