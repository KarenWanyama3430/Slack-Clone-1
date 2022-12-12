import React from "react";
import { Grid } from "semantic-ui-react";
import ColorPanel from "./colorPanel/ColorPanel";
import SidePanel from "./sidePanel/SidePanel";
import Messages from "./messages/Messages";
import MetaPanel from "./metaPanel/MetaPanel";
import { connect } from "react-redux";
import Skeleton from "./messages/Skeleton";

function App({
  currentChannel,
  isPrivateChannel,
  primaryColor,
  secondaryColor,
}) {
  return (
    <Grid
      columns="equal"
      className="app"
      style={{ background: secondaryColor }}
    >
      <ColorPanel />
      <SidePanel primaryColor={primaryColor} />
      <Grid.Column style={{ marginLeft: 320 }}>
        {currentChannel ? (
          <Messages key={currentChannel.id} currentChannel={currentChannel} />
        ) : (
          [...Array(10)].map((_, i) => <Skeleton key={i} />)
        )}
      </Grid.Column>
      <Grid.Column width={4}>
        {!isPrivateChannel && currentChannel && <MetaPanel />}
      </Grid.Column>
    </Grid>
  );
}
const mapStateToProps = (state) => {
  return {
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel,
    primaryColor: state.colors.primaryColor,
    secondaryColor: state.colors.secondaryColor,
  };
};
export default connect(mapStateToProps)(App);
